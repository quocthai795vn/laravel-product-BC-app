<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConnectStoreRequest;
use App\Http\Resources\StoreConnectionResource;
use App\Models\StoreConnection;
use App\Services\BigCommerceApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BigCommerceController extends Controller
{
    /**
     * Test and save store connection.
     */
    public function connect(ConnectStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Test connection first
        $apiService = new BigCommerceApiService(
            $validated['store_hash'],
            $validated['access_token']
        );

        $connectionTest = $apiService->testConnection();

        if (!$connectionTest['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to BigCommerce store',
                'error' => $connectionTest['error'],
            ], 422);
        }

        // Save connection
        $storeConnection = StoreConnection::updateOrCreate(
            [
                'user_id' => auth()->id() ?? 1, // Use authenticated user or default
                'store_hash' => $validated['store_hash'],
            ],
            [
                'name' => $validated['name'],
                'access_token' => $validated['access_token'],
                'type' => $validated['type'],
                'tree_id' => $validated['tree_id'] ?? null,
                'tree_name' => $validated['tree_name'] ?? null,
                'is_active' => true,
                'last_connected_at' => now(),
                'metadata' => [
                    'store_name' => $connectionTest['store_name'] ?? '',
                    'store_url' => $connectionTest['store_url'] ?? '',
                ],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Store connected successfully',
            'store' => new StoreConnectionResource($storeConnection),
            'store_info' => $connectionTest,
        ], 200);
    }

    /**
     * Get all store connections for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $stores = StoreConnection::where('user_id', $userId)
            ->when($request->get('type'), function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($request->get('active_only'), function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'stores' => StoreConnectionResource::collection($stores),
        ]);
    }

    /**
     * Get a single store connection.
     */
    public function show(int $id): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'store' => new StoreConnectionResource($store),
        ]);
    }

    /**
     * Delete a store connection.
     */
    public function destroy(int $id): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($id);

        $store->delete();

        return response()->json([
            'success' => true,
            'message' => 'Store connection deleted successfully',
        ]);
    }

    /**
     * Test an existing store connection.
     */
    public function testConnection(int $id): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($id);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        $connectionTest = $apiService->testConnection();

        if ($connectionTest['success']) {
            $store->markAsConnected();
        }

        return response()->json([
            'success' => $connectionTest['success'],
            'message' => $connectionTest['success']
                ? 'Connection successful'
                : 'Connection failed',
            'store_info' => $connectionTest,
        ]);
    }

    /**
     * Get category trees for a store.
     */
    public function getCategoryTrees(int $id): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $store = StoreConnection::where('user_id', $userId)
            ->findOrFail($id);

        $apiService = new BigCommerceApiService(
            $store->store_hash,
            $store->access_token
        );

        try {
            $trees = $apiService->getCategoryTrees();

            return response()->json([
                'success' => true,
                'trees' => $trees,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category trees',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
