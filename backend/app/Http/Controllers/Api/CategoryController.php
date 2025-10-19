<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompareCategoriesRequest;
use App\Http\Requests\MigrateCategoriesRequest;
use App\Http\Resources\CategoryComparisonResource;
use App\Http\Resources\MigrationLogResource;
use App\Models\MigrationLog;
use App\Models\StoreConnection;
use App\Services\BigCommerceApiService;
use App\Services\CategoryComparisonService;
use App\Services\CategoryMappingService;
use App\Services\CategoryMigrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryComparisonService $comparisonService,
        private CategoryMappingService $mappingService
    ) {}

    /**
     * Get categories from source store.
     */
    public function getSourceCategories(int $storeId): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->where('type', 'source')
            ->findOrFail($storeId);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        try {
            $categories = $apiService->getAllCategories();

            return response()->json([
                'success' => true,
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                ],
                'categories' => $categories,
                'count' => count($categories),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get categories from target store.
     */
    public function getTargetCategories(int $storeId): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->where('type', 'target')
            ->findOrFail($storeId);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        try {
            $categories = $store->tree_id
                ? $apiService->getCategoriesByTree($store->tree_id)
                : $apiService->getAllCategories();

            return response()->json([
                'success' => true,
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                    'tree_id' => $store->tree_id,
                ],
                'categories' => $categories,
                'count' => count($categories),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Compare categories between source and target stores.
     */
    public function compare(CompareCategoriesRequest $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;
        $validated = $request->validated();

        $sourceStore = StoreConnection::where('user_id', $userId)
            ->findOrFail($validated['source_store_id']);

        $targetStore = StoreConnection::where('user_id', $userId)
            ->findOrFail($validated['target_store_id']);

        // Fetch categories from both stores
        $sourceApi = new BigCommerceApiService(
            $sourceStore->store_hash,
            $sourceStore->access_token
        );

        $targetApi = new BigCommerceApiService(
            $targetStore->store_hash,
            $targetStore->access_token
        );

        try {
            // Both stores use tree endpoint to ensure same data structure
            $sourceCategories = $sourceStore->tree_id
                ? $sourceApi->getCategoriesByTree($sourceStore->tree_id)
                : $sourceApi->getAllCategories();

            $targetCategories = $targetStore->tree_id
                ? $targetApi->getCategoriesByTree($targetStore->tree_id)
                : $targetApi->getAllCategories();

            // Perform comparison
            $comparison = $this->comparisonService->compare(
                $sourceCategories,
                $targetCategories
            );

            return response()->json([
                'success' => true,
                'source_store' => [
                    'id' => $sourceStore->id,
                    'name' => $sourceStore->name,
                ],
                'target_store' => [
                    'id' => $targetStore->id,
                    'name' => $targetStore->name,
                    'tree_id' => $targetStore->tree_id,
                ],
                'comparison' => new CategoryComparisonResource($comparison),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to compare categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Migrate categories from source to target.
     */
    public function migrate(MigrateCategoriesRequest $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;
        $validated = $request->validated();

        $sourceStore = StoreConnection::where('user_id', $userId)
            ->findOrFail($validated['source_store_id']);

        $targetStore = StoreConnection::where('user_id', $userId)
            ->findOrFail($validated['target_store_id']);

        // Create migration log
        $migrationLog = MigrationLog::create([
            'user_id' => $userId,
            'source_store_id' => $sourceStore->id,
            'target_store_id' => $targetStore->id,
            'categories_count' => count($validated['categories']),
            'status' => 'pending',
        ]);

        try {
            $migrationLog->markAsStarted();

            // Initialize services
            $sourceApi = new BigCommerceApiService(
                $sourceStore->store_hash,
                $sourceStore->access_token
            );

            $targetApi = new BigCommerceApiService(
                $targetStore->store_hash,
                $targetStore->access_token
            );

            $migrationService = new CategoryMigrationService(
                $sourceApi,
                $targetApi,
                $this->mappingService
            );

            $migrationService->setMigrationLog($migrationLog);

            $operation = $validated['operation'];
            $results = [];

            switch ($operation) {
                case 'create':
                    $results = $migrationService->migrate(
                        $validated['categories'],
                        $sourceStore->id,
                        $targetStore->id,
                        $targetStore->tree_id
                    );
                    break;

                case 'update':
                    $results = $migrationService->updateCategories(
                        $validated['categories']
                    );
                    break;

                case 'delete':
                    $results = $migrationService->deleteCategories(
                        $validated['categories'],
                        $targetStore->tree_id
                    );
                    break;

                case 'all':
                    // Perform all operations
                    $createResults = $migrationService->migrate(
                        $validated['categories']['missing'] ?? [],
                        $sourceStore->id,
                        $targetStore->id,
                        $targetStore->tree_id
                    );

                    $updateResults = $migrationService->updateCategories(
                        $validated['categories']['updated'] ?? []
                    );

                    $deleteResults = $migrationService->deleteCategories(
                        $validated['categories']['deleted'] ?? [],
                        $targetStore->tree_id
                    );

                    $results = [
                        'created' => $createResults['created'] ?? 0,
                        'updated' => $updateResults['updated'] ?? 0,
                        'deleted' => $deleteResults['deleted'] ?? 0,
                        'skipped' => ($createResults['skipped'] ?? 0) + ($updateResults['skipped'] ?? 0),
                        'failed' => ($createResults['failed'] ?? 0) + ($updateResults['failed'] ?? 0) + ($deleteResults['failed'] ?? 0),
                        'details' => array_merge(
                            $createResults['details'] ?? [],
                            $updateResults['details'] ?? [],
                            $deleteResults['details'] ?? []
                        ),
                    ];
                    break;
            }

            // Determine final status
            $hasFailures = ($results['failed'] ?? 0) > 0;
            $hasSuccesses = ($results['created'] ?? 0) + ($results['updated'] ?? 0) + ($results['deleted'] ?? 0) > 0;

            if ($hasFailures && $hasSuccesses) {
                $migrationLog->markAsPartial($results);
            } elseif ($hasFailures) {
                $migrationLog->markAsFailed('All operations failed');
            } else {
                $migrationLog->markAsCompleted($results);
            }

            return response()->json([
                'success' => true,
                'message' => 'Migration completed',
                'migration_log' => new MigrationLogResource($migrationLog->fresh()),
                'results' => $results,
            ]);

        } catch (\Exception $e) {
            $migrationLog->markAsFailed($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Migration failed',
                'error' => $e->getMessage(),
                'migration_log' => new MigrationLogResource($migrationLog->fresh()),
            ], 500);
        }
    }

    /**
     * Get migration logs.
     */
    public function logs(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $logs = MigrationLog::where('user_id', $userId)
            ->with(['sourceStore', 'targetStore'])
            ->when($request->get('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->get('source_store_id'), function ($query, $sourceStoreId) {
                $query->where('source_store_id', $sourceStoreId);
            })
            ->when($request->get('target_store_id'), function ($query, $targetStoreId) {
                $query->where('target_store_id', $targetStoreId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'logs' => MigrationLogResource::collection($logs),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get a single migration log.
     */
    public function showLog(int $id, Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $log = MigrationLog::where('user_id', $userId)
            ->with(['sourceStore', 'targetStore'])
            ->findOrFail($id);

        // Include details if requested
        $request->merge(['include_details' => true]);

        return response()->json([
            'success' => true,
            'log' => new MigrationLogResource($log),
        ]);
    }

    /**
     * Export categories from a store.
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'store_id' => 'required|integer|exists:store_connections,id',
            'format' => 'required|in:csv,json',
        ]);

        $userId = auth()->id() ?? 1;
        $storeId = $request->input('store_id');
        $format = $request->input('format');

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($storeId);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        try {
            // Fetch all categories from the store
            $categories = $store->tree_id
                ? $apiService->getCategoriesByTree($store->tree_id)
                : $apiService->getAllCategories();

            if (empty($categories)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No categories found to export',
                ], 404);
            }

            // Generate filename
            $timestamp = date('Y-m-d');
            $filename = "{$store->name}_categories_{$timestamp}.{$format}";

            // Return data for frontend to process
            // Frontend will handle CSV/JSON formatting and download
            return response()->json([
                'success' => true,
                'data' => $categories,
                'filename' => $filename,
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                    'store_hash' => $store->store_hash,
                ],
                'export_info' => [
                    'total_categories' => count($categories),
                    'export_date' => now()->toIso8601String(),
                    'format' => $format,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import categories into a store.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'store_id' => 'required|integer|exists:store_connections,id',
            'categories' => 'required|array|min:1',
            'categories.*.name' => 'required|string',
            'categories.*.parent_id' => 'nullable|integer',
            'categories.*.description' => 'nullable|string',
            'categories.*.sort_order' => 'nullable|integer',
            'categories.*.page_title' => 'nullable|string',
            'categories.*.meta_keywords' => 'nullable',
            'categories.*.meta_description' => 'nullable|string',
            'categories.*.search_keywords' => 'nullable|string',
            'categories.*.custom_url' => 'nullable|string',
            'categories.*.image_url' => 'nullable|string',
            'categories.*.is_visible' => 'nullable|boolean',
            'categories.*.default_product_sort' => 'nullable|string',
            'categories.*.layout_file' => 'nullable|string',
        ]);

        $userId = auth()->id() ?? 1;
        $storeId = $request->input('store_id');
        $categories = $request->input('categories');

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($storeId);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        try {
            $results = [
                'created' => 0,
                'updated' => 0,
                'failed' => 0,
                'details' => [],
            ];

            // Map old IDs to new IDs for parent references
            $idMapping = [];

            // Sort categories by parent_id to ensure parents are created first
            usort($categories, function ($a, $b) {
                $aParent = $a['parent_id'] ?? 0;
                $bParent = $b['parent_id'] ?? 0;
                return $aParent <=> $bParent;
            });

            foreach ($categories as $category) {
                try {
                    $oldId = $category['id'] ?? null;
                    $parentId = $category['parent_id'] ?? 0;

                    // Remap parent_id if it was in the import
                    if ($parentId > 0 && isset($idMapping[$parentId])) {
                        $parentId = $idMapping[$parentId];
                    }

                    // Prepare category data for BigCommerce API
                    $categoryData = [
                        'name' => $category['name'],
                        'parent_id' => $parentId,
                        'description' => $category['description'] ?? '',
                        'sort_order' => $category['sort_order'] ?? 0,
                        'page_title' => $category['page_title'] ?? '',
                        'meta_description' => $category['meta_description'] ?? '',
                        'search_keywords' => $category['search_keywords'] ?? '',
                        'is_visible' => $category['is_visible'] ?? true,
                        'default_product_sort' => $category['default_product_sort'] ?? 'use_store_settings',
                    ];

                    // Handle meta_keywords (can be array or string)
                    if (isset($category['meta_keywords'])) {
                        if (is_array($category['meta_keywords'])) {
                            $categoryData['meta_keywords'] = $category['meta_keywords'];
                        } else {
                            $categoryData['meta_keywords'] = array_filter(
                                array_map('trim', explode(',', $category['meta_keywords']))
                            );
                        }
                    }

                    // Handle custom_url
                    if (isset($category['custom_url']) && !empty($category['custom_url'])) {
                        $categoryData['custom_url'] = [
                            'url' => $category['custom_url'],
                            'is_customized' => true,
                        ];
                    }

                    // Handle image_url
                    if (isset($category['image_url']) && !empty($category['image_url'])) {
                        $categoryData['image_url'] = $category['image_url'];
                    }

                    // Handle layout_file
                    if (isset($category['layout_file']) && !empty($category['layout_file'])) {
                        $categoryData['layout_file'] = $category['layout_file'];
                    }

                    // Create category via BigCommerce API
                    $createdCategory = $apiService->createCategory($categoryData, $store->tree_id);

                    // Store ID mapping
                    if ($oldId && isset($createdCategory['id'])) {
                        $idMapping[$oldId] = $createdCategory['id'];
                    }

                    $results['created']++;
                    $results['details'][] = [
                        'status' => 'success',
                        'category_name' => $category['name'],
                        'category_id' => $createdCategory['id'] ?? null,
                        'old_id' => $oldId,
                        'message' => 'Created successfully',
                    ];

                    // Rate limiting: sleep for 500ms
                    usleep(500000);

                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['details'][] = [
                        'status' => 'failed',
                        'category_name' => $category['name'],
                        'old_id' => $oldId ?? null,
                        'message' => $e->getMessage(),
                    ];
                }
            }

            $message = "Import completed. Created: {$results['created']}, Failed: {$results['failed']}";

            return response()->json([
                'success' => true,
                'message' => $message,
                'results' => $results,
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
