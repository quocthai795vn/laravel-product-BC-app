<?php

namespace App\Services;

class CategoryComparisonService
{
    private CategoryMappingService $mappingService;

    public function __construct(CategoryMappingService $mappingService)
    {
        $this->mappingService = $mappingService;
    }

    /**
     * Compare categories between source and target stores.
     */
    public function compare(array $sourceCategories, array $targetCategories): array
    {
        // Build path maps for matching
        $sourcePaths = $this->mappingService->buildPathMap($sourceCategories, false);
        $targetPaths = $this->mappingService->buildPathMap($targetCategories, true);

        $sourcePathKeys = array_keys($sourcePaths);
        $targetPathKeys = array_keys($targetPaths);

        $result = [
            'missing' => [],    // In source, not in target (need migration)
            'deleted' => [],    // In target, not in source (removed from source)
            'updated' => [],    // In both, but changed
            'unchanged' => [],  // In both, no changes
        ];

        // Find missing categories (in source but not in target)
        foreach ($sourcePathKeys as $path) {
            if (!in_array($path, $targetPathKeys)) {
                $result['missing'][] = $sourcePaths[$path];
            } else {
                // Category exists in both, check for changes
                $sourceInfo = $this->mappingService->extractCategoryInfo(
                    $sourcePaths[$path]['data'],
                    $sourceCategories,
                    false
                );
                $targetInfo = $this->mappingService->extractCategoryInfo(
                    $targetPaths[$path]['data'],
                    $targetCategories,
                    true
                );

                $changes = $this->detectChanges($sourceInfo, $targetInfo);

                if (!empty($changes)) {
                    $result['updated'][] = [
                        'source' => $sourceInfo,
                        'target' => $targetInfo,
                        'changes' => $changes,
                        'path' => $path,
                    ];
                } else {
                    $result['unchanged'][] = $targetInfo;
                }
            }
        }

        // Find deleted categories (in target but not in source)
        foreach ($targetPathKeys as $path) {
            if (!in_array($path, $sourcePathKeys)) {
                $result['deleted'][] = $targetPaths[$path];
            }
        }

        // Add summary statistics
        $result['summary'] = [
            'total_source_categories' => count($sourceCategories),
            'total_target_categories' => count($targetCategories),
            'missing_count' => count($result['missing']),
            'deleted_count' => count($result['deleted']),
            'updated_count' => count($result['updated']),
            'unchanged_count' => count($result['unchanged']),
        ];

        return $result;
    }

    /**
     * Detect field-level changes between two categories.
     */
    public function detectChanges(array $source, array $target): array
    {
        $changes = [];

        // Only compare content fields, NOT structural fields like parent_id
        // (parent_id will be different between stores)
        $fieldsToCompare = [
            'name',
            'description',
            'custom_url',
            'page_title',
            'meta_description',
            'search_keywords',
            'is_visible',
            'image_url',
            'default_product_sort',
            'layout_file',
        ];

        foreach ($fieldsToCompare as $field) {
            $sourceValue = $this->mappingService->normalizeValue($source[$field] ?? null);
            $targetValue = $this->mappingService->normalizeValue($target[$field] ?? null);

            if ($sourceValue !== $targetValue) {
                $changes[$field] = [
                    'source' => $source[$field] ?? null,
                    'target' => $target[$field] ?? null,
                ];
            }
        }

        // Compare meta_keywords separately (array comparison)
        $sourceKeywords = $source['meta_keywords'] ?? [];
        $targetKeywords = $target['meta_keywords'] ?? [];

        if (is_array($sourceKeywords) && is_array($targetKeywords)) {
            sort($sourceKeywords);
            sort($targetKeywords);
            if ($sourceKeywords !== $targetKeywords) {
                $changes['meta_keywords'] = [
                    'source' => $source['meta_keywords'] ?? [],
                    'target' => $target['meta_keywords'] ?? [],
                ];
            }
        } elseif ($sourceKeywords !== $targetKeywords) {
            $changes['meta_keywords'] = [
                'source' => $source['meta_keywords'] ?? [],
                'target' => $target['meta_keywords'] ?? [],
            ];
        }

        return $changes;
    }

    /**
     * Generate comparison summary for display.
     */
    public function generateSummary(array $comparisonResult): array
    {
        return [
            'total_source' => $comparisonResult['summary']['total_source_categories'] ?? 0,
            'total_target' => $comparisonResult['summary']['total_target_categories'] ?? 0,
            'missing' => $comparisonResult['summary']['missing_count'] ?? 0,
            'deleted' => $comparisonResult['summary']['deleted_count'] ?? 0,
            'updated' => $comparisonResult['summary']['updated_count'] ?? 0,
            'unchanged' => $comparisonResult['summary']['unchanged_count'] ?? 0,
            'actions_required' => (
                ($comparisonResult['summary']['missing_count'] ?? 0) +
                ($comparisonResult['summary']['updated_count'] ?? 0) +
                ($comparisonResult['summary']['deleted_count'] ?? 0)
            ),
        ];
    }

    /**
     * Filter comparison results by status.
     */
    public function filterByStatus(array $comparisonResult, string $status): array
    {
        $validStatuses = ['missing', 'deleted', 'updated', 'unchanged'];

        if (!in_array($status, $validStatuses)) {
            return [];
        }

        return $comparisonResult[$status] ?? [];
    }

    /**
     * Search comparison results by category name.
     */
    public function search(array $comparisonResult, string $query): array
    {
        $query = strtolower(trim($query));
        $results = [];

        foreach (['missing', 'deleted', 'updated', 'unchanged'] as $status) {
            foreach ($comparisonResult[$status] ?? [] as $item) {
                $name = '';

                if ($status === 'updated') {
                    $name = strtolower($item['source']['name'] ?? '');
                } else {
                    $name = strtolower($item['name'] ?? '');
                }

                if (str_contains($name, $query)) {
                    $results[] = array_merge($item, ['status' => $status]);
                }
            }
        }

        return $results;
    }
}
