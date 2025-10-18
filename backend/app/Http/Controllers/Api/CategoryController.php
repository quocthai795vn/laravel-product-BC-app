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
}
