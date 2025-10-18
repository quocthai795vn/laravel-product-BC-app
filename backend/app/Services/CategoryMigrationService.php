<?php

namespace App\Services;

use App\Models\CategoryMapping;
use App\Models\MigrationLog;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryMigrationService
{
    private BigCommerceApiService $sourceApi;
    private BigCommerceApiService $targetApi;
    private CategoryMappingService $mappingService;
    private ?MigrationLog $migrationLog = null;

    public function __construct(
        BigCommerceApiService $sourceApi,
        BigCommerceApiService $targetApi,
        CategoryMappingService $mappingService
    ) {
        $this->sourceApi = $sourceApi;
        $this->targetApi = $targetApi;
        $this->mappingService = $mappingService;
    }

    /**
     * Set the migration log for tracking progress.
     */
    public function setMigrationLog(MigrationLog $log): void
    {
        $this->migrationLog = $log;
    }

    /**
     * Migrate categories from source to target.
     */
    public function migrate(
        array $categories,
        int $sourceStoreId,
        int $targetStoreId,
        int $treeId,
        callable $progressCallback = null
    ): array {
        $results = [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
            'details' => [],
        ];

        // Sort by parent_id to ensure parents are created first
        $categories = $this->mappingService->sortByParentId($categories, false);

        $totalCategories = count($categories);
        $currentIndex = 0;

        foreach ($categories as $category) {
            $currentIndex++;

            try {
                $result = $this->migrateCategory($category, $sourceStoreId, $targetStoreId, $treeId);

                $results[$result['status']]++;
                $results['details'][] = $result;

                // Call progress callback
                if ($progressCallback) {
                    $progress = [
                        'current' => $currentIndex,
                        'total' => $totalCategories,
                        'percentage' => round(($currentIndex / $totalCategories) * 100, 2),
                        'results' => $results,
                        'current_category' => $category['name'] ?? 'Unknown',
                    ];
                    $progressCallback($progress);
                }

                // Update migration log
                if ($this->migrationLog) {
                    $this->migrationLog->updateProgress($results, $results['details']);
                }

                // Rate limiting: 500ms delay between operations
                usleep(500000);

            } catch (Exception $e) {
                $results['failed']++;
                $results['details'][] = [
                    'status' => 'failed',
                    'category_id' => $category['id'] ?? null,
                    'category_name' => $category['name'] ?? 'Unknown',
                    'error' => $e->getMessage(),
                ];

                Log::error('Category migration failed', [
                    'category' => $category['name'] ?? 'Unknown',
                    'error' => $e->getMessage(),
                ]);

                // Call progress callback for error
                if ($progressCallback) {
                    $progress = [
                        'current' => $currentIndex,
                        'total' => $totalCategories,
                        'percentage' => round(($currentIndex / $totalCategories) * 100, 2),
                        'results' => $results,
                        'current_category' => $category['name'] ?? 'Unknown',
                        'error' => $e->getMessage(),
                    ];
                    $progressCallback($progress);
                }
            }
        }

        return $results;
    }

    /**
     * Migrate a single category.
     */
    private function migrateCategory(
        array $category,
        int $sourceStoreId,
        int $targetStoreId,
        int $treeId
    ): array {
        // Handle both CategoryWithStatus (has 'id') and UpdatedCategory (has 'source_id')
        $oldId = $category['id'] ?? $category['source_id'] ?? null;

        if (!$oldId) {
            return [
                'status' => 'failed',
                'category_id' => null,
                'category_name' => $category['name'] ?? 'Unknown',
                'error' => 'Category ID not found in request data',
            ];
        }

        $name = $category['name'] ?? 'Unknown';

        // Fetch full category data from source
        $fullCategory = $this->sourceApi->getCategoryById($oldId);

        if (!$fullCategory) {
            return [
                'status' => 'failed',
                'category_id' => $oldId,
                'category_name' => $name,
                'error' => 'Failed to fetch category data from source',
            ];
        }

        // Map parent_id if exists
        $parentId = $fullCategory['parent_id'] ?? 0;
        if ($parentId > 0) {
            $mappedParentId = CategoryMapping::getNewCategoryId($sourceStoreId, $targetStoreId, $parentId);
            if ($mappedParentId) {
                $parentId = $mappedParentId;
            }
        }

        // Prepare category data for creation
        $categoryData = [
            'parent_id' => $parentId,
            'tree_id' => $treeId,
            'name' => $fullCategory['name'],
            'description' => $fullCategory['description'] ?? '',
            'sort_order' => $fullCategory['sort_order'] ?? 0,
            'page_title' => $fullCategory['page_title'] ?? '',
            'meta_keywords' => $fullCategory['meta_keywords'] ?? [],
            'meta_description' => $fullCategory['meta_description'] ?? '',
            'search_keywords' => $fullCategory['search_keywords'] ?? '',
            'is_visible' => $fullCategory['is_visible'] ?? true,
            'default_product_sort' => $fullCategory['default_product_sort'] ?? 'use_store_settings',
            'layout_file' => $fullCategory['layout_file'] ?? '',
        ];

        // Add custom_url if present
        if (!empty($fullCategory['custom_url']['url'])) {
            $categoryData['custom_url'] = [
                'url' => $fullCategory['custom_url']['url'],
                'is_customized' => true,
            ];
        }

        // Add image_url if present
        if (!empty($fullCategory['image_url'])) {
            $categoryData['image_url'] = $fullCategory['image_url'];
        }

        // Create category in target store
        $createResult = $this->targetApi->createCategory($categoryData);

        if ($createResult['success'] && isset($createResult['category_id'])) {
            $newCategoryId = $createResult['category_id'];

            // Store mapping
            $path = $this->mappingService->buildCategoryPath([$fullCategory], $oldId);
            CategoryMapping::createOrUpdateMapping(
                $sourceStoreId,
                $targetStoreId,
                $oldId,
                $newCategoryId,
                $name,
                $path,
                $parentId
            );

            return [
                'status' => 'created',
                'old_category_id' => $oldId,
                'new_category_id' => $newCategoryId,
                'category_name' => $name,
                'parent_id' => $parentId,
            ];
        }

        return [
            'status' => 'failed',
            'category_id' => $oldId,
            'category_name' => $name,
            'error' => $createResult['error'] ?? 'Unknown error',
        ];
    }

    /**
     * Update categories that have changes.
     */
    public function updateCategories(
        array $updates,
        callable $progressCallback = null
    ): array {
        $results = [
            'updated' => 0,
            'skipped' => 0,
            'failed' => 0,
            'details' => [],
        ];

        $totalUpdates = count($updates);
        $currentIndex = 0;

        foreach ($updates as $updateData) {
            $currentIndex++;

            // Log the incoming data for debugging
            Log::info('Processing category update', ['update_data' => $updateData]);

            // Handle both old and new data structures
            if (isset($updateData['target'])) {
                // Old structure: {target: {...}, changes: {...}}
                $targetCategory = $updateData['target'];
                $changes = $updateData['changes'];
                $categoryId = $targetCategory['id'];
                $name = $targetCategory['name'];
            } else {
                // New structure from frontend: {target_id, target_data, changes: [...]}
                $categoryId = $updateData['target_id'] ?? $updateData['target_data']['id'] ?? null;
                $name = $updateData['name'] ?? 'Unknown';
                $changes = $updateData['changes'] ?? [];
            }

            Log::info('Extracted data', [
                'category_id' => $categoryId,
                'name' => $name,
                'changes' => $changes
            ]);

            if (!$categoryId) {
                $results['failed']++;
                $results['details'][] = [
                    'status' => 'failed',
                    'category_id' => null,
                    'category_name' => $name,
                    'error' => 'Target category ID not found',
                ];
                continue;
            }

            // Build update data - only update changed fields
            $updateFields = [];

            foreach ($changes as $changeData) {
                Log::info('Processing change', ['change_data' => $changeData]);

                // Handle array of change objects: [{field: 'description', source_value: '...', target_value: '...'}]
                if (is_array($changeData) && isset($changeData['field'])) {
                    $field = $changeData['field'];
                    $sourceValue = $changeData['source_value'] ?? null;

                    // Convert null to empty string for BigCommerce API (null values are ignored)
                    if ($sourceValue === null && !in_array($field, ['parent_id', 'sort_order', 'is_visible'])) {
                        $sourceValue = '';
                    }

                    if ($field === 'custom_url') {
                        $updateFields['custom_url'] = [
                            'url' => $sourceValue ?: '',
                            'is_customized' => true,
                        ];
                    } else {
                        $updateFields[$field] = $sourceValue;
                    }
                } elseif (is_string($changeData)) {
                    // Handle old format: ['field_name' => ['source' => '...', 'target' => '...']]
                    // This is for backward compatibility
                    $field = $changeData;
                    $change = $changes[$field] ?? [];

                    if ($field === 'custom_url') {
                        $updateFields['custom_url'] = [
                            'url' => $change['source'] ?? '',
                            'is_customized' => true,
                        ];
                    } else {
                        $updateFields[$field] = $change['source'] ?? '';
                    }
                }
            }

            Log::info('Built update fields', ['update_fields' => $updateFields]);

            if (empty($updateFields)) {
                $results['skipped']++;
                $results['details'][] = [
                    'status' => 'skipped',
                    'category_id' => $categoryId,
                    'category_name' => $name,
                    'reason' => 'No fields to update',
                ];
                continue;
            }

            // Update category
            $updateResult = $this->targetApi->updateCategory($categoryId, $updateFields);

            if ($updateResult['success']) {
                $results['updated']++;
                $results['details'][] = [
                    'status' => 'updated',
                    'category_id' => $categoryId,
                    'category_name' => $name,
                    'updated_fields' => array_keys($updateFields),
                ];
            } else {
                $results['failed']++;
                $results['details'][] = [
                    'status' => 'failed',
                    'category_id' => $categoryId,
                    'category_name' => $name,
                    'error' => $updateResult['error'] ?? 'Unknown error',
                ];
            }

            // Progress callback
            if ($progressCallback) {
                $progress = [
                    'current' => $currentIndex,
                    'total' => $totalUpdates,
                    'percentage' => round(($currentIndex / $totalUpdates) * 100, 2),
                    'results' => $results,
                ];
                $progressCallback($progress);
            }

            usleep(500000);
        }

        return $results;
    }

    /**
     * Delete categories.
     */
    public function deleteCategories(
        array $categories,
        int $treeId,
        callable $progressCallback = null
    ): array {
        $results = [
            'deleted' => 0,
            'failed' => 0,
            'details' => [],
        ];

        // Sort by parent_id descending to delete children first
        $categories = $this->mappingService->sortByParentId($categories, true);

        $totalCategories = count($categories);
        $currentIndex = 0;

        foreach ($categories as $category) {
            $currentIndex++;
            $categoryId = $category['id'];
            $name = $category['name'] ?? 'Unknown';

            $deleteResult = $this->targetApi->deleteCategory($categoryId, $treeId);

            if ($deleteResult['success']) {
                $results['deleted']++;
                $results['details'][] = [
                    'status' => 'deleted',
                    'category_id' => $categoryId,
                    'category_name' => $name,
                ];
            } else {
                $results['failed']++;
                $results['details'][] = [
                    'status' => 'failed',
                    'category_id' => $categoryId,
                    'category_name' => $name,
                    'error' => $deleteResult['error'] ?? 'Unknown error',
                ];
            }

            // Progress callback
            if ($progressCallback) {
                $progress = [
                    'current' => $currentIndex,
                    'total' => $totalCategories,
                    'percentage' => round(($currentIndex / $totalCategories) * 100, 2),
                    'results' => $results,
                ];
                $progressCallback($progress);
            }

            usleep(500000);
        }

        return $results;
    }
}
