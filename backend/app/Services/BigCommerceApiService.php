<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BigCommerceApiService
{
    private string $storeHash;
    private string $accessToken;
    private string $baseUrl;
    private int $timeout = 120;
    private int $retryTimes = 3;
    private int $retryDelay = 500; // milliseconds

    public function __construct(string $storeHash, string $accessToken)
    {
        $this->storeHash = $storeHash;
        $this->accessToken = $accessToken;
        $this->baseUrl = "https://api.bigcommerce.com/stores/{$storeHash}";
    }

    /**
     * Test the connection to BigCommerce API.
     */
    public function testConnection(): array
    {
        try {
            $response = $this->makeRequest('GET', '/v2/store');

            return [
                'success' => true,
                'store_name' => $response['name'] ?? 'Unknown',
                'store_url' => $response['domain'] ?? '',
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all categories with pagination.
     */
    public function getAllCategories(int $limit = 250): array
    {
        $allCategories = [];
        $page = 1;

        while (true) {
            $response = $this->makeRequest('GET', '/v3/catalog/categories', [
                'limit' => $limit,
                'page' => $page,
            ]);

            $categories = $response['data'] ?? [];

            // Log the first few categories to see the data structure
            if ($page === 1 && !empty($categories)) {
                Log::info('Source store categories (first 3)', [
                    'sample' => array_slice($categories, 0, 3)
                ]);
            }

            if (empty($categories)) {
                break;
            }

            $allCategories = array_merge($allCategories, $categories);

            // Check if there are more pages
            if (count($categories) < $limit) {
                break;
            }

            $page++;
            usleep(100000); // 100ms delay between pages
        }

        return $allCategories;
    }

    /**
     * Get categories by tree ID using ONLY /v3/catalog/trees/categories endpoint.
     */
    public function getCategoriesByTree(int $treeId, int $limit = 250): array
    {
        $allCategories = [];
        $page = 1;

        while (true) {
            $response = $this->makeRequest('GET', '/v3/catalog/trees/categories', [
                'tree_id:in' => $treeId,
                'limit' => $limit,
                'page' => $page,
            ]);

            $categories = $response['data'] ?? [];

            // Log the first few categories to see the data structure
            if ($page === 1 && !empty($categories)) {
                Log::info('Tree categories', [
                    'tree_id' => $treeId,
                    'count' => count($categories),
                    'first_category' => $categories[0] ?? null
                ]);
            }

            if (empty($categories)) {
                break;
            }

            $allCategories = array_merge($allCategories, $categories);

            if (count($categories) < $limit) {
                break;
            }

            $page++;
            usleep(100000);
        }

        return $allCategories;
    }

    /**
     * Get a single category by ID.
     */
    public function getCategoryById(int $categoryId): ?array
    {
        try {
            $response = $this->makeRequest('GET', "/v3/catalog/categories/{$categoryId}");
            return $response['data'] ?? null;
        } catch (Exception $e) {
            Log::error("Failed to fetch category {$categoryId}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create a new category.
     */
    public function createCategory(array $categoryData): array
    {
        // API requires an array of categories
        $payload = [$categoryData];

        $response = $this->makeRequest('POST', '/v3/catalog/trees/categories', $payload);

        if (isset($response['data'][0])) {
            return [
                'success' => true,
                'category_id' => $response['data'][0]['category_id'] ?? $response['data'][0]['id'] ?? null,
                'data' => $response['data'][0],
            ];
        }

        return [
            'success' => false,
            'error' => 'Failed to create category',
            'response' => $response,
        ];
    }

    /**
     * Update a category.
     */
    public function updateCategory(int $categoryId, array $categoryData): array
    {
        try {
            Log::info('Updating category in BigCommerce', [
                'category_id' => $categoryId,
                'data' => $categoryData
            ]);

            $response = $this->makeRequest('PUT', "/v3/catalog/categories/{$categoryId}", $categoryData);

            Log::info('BigCommerce update response', ['response' => $response]);

            return [
                'success' => true,
                'data' => $response['data'] ?? $response,
            ];
        } catch (Exception $e) {
            Log::error('BigCommerce update failed', [
                'category_id' => $categoryId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a category.
     */
    public function deleteCategory(int $categoryId, ?int $treeId = null): array
    {
        try {
            $endpoint = $treeId
                ? "/v3/catalog/trees/{$treeId}/categories/{$categoryId}"
                : "/v3/catalog/categories/{$categoryId}";

            $this->makeRequest('DELETE', $endpoint);

            return ['success' => true];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Make an API request with retry logic.
     */
    private function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;
        $attempt = 0;

        while ($attempt < $this->retryTimes) {
            try {
                $response = Http::withHeaders([
                    'X-Auth-Token' => $this->accessToken,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->timeout($this->timeout);

                // Add query parameters for GET requests
                if ($method === 'GET' && !empty($data)) {
                    $response = $response->get($url, $data);
                } elseif ($method === 'POST') {
                    $response = $response->post($url, $data);
                } elseif ($method === 'PUT') {
                    $response = $response->put($url, $data);
                } elseif ($method === 'DELETE') {
                    $response = $response->delete($url);
                } else {
                    $response = $response->send($method, $url, ['json' => $data]);
                }

                // Handle rate limiting (429)
                if ($response->status() === 429) {
                    $attempt++;
                    $retryAfter = $response->header('Retry-After') ?? 2;
                    sleep((int)$retryAfter);
                    continue;
                }

                // Throw exception for error responses
                if (!$response->successful() && $response->status() !== 204) {
                    throw new Exception(
                        "API Error: HTTP {$response->status()} - " .
                        ($response->json()['title'] ?? $response->body())
                    );
                }

                // Return empty array for 204 No Content
                if ($response->status() === 204) {
                    return [];
                }

                return $response->json() ?? [];

            } catch (Exception $e) {
                $attempt++;

                // If this was the last attempt, throw the exception
                if ($attempt >= $this->retryTimes) {
                    Log::error("BigCommerce API request failed: {$method} {$endpoint}", [
                        'error' => $e->getMessage(),
                        'data' => $data,
                    ]);
                    throw $e;
                }

                // Wait before retrying
                usleep($this->retryDelay * 1000 * $attempt);
            }
        }

        throw new Exception('Request failed after retries');
    }

    /**
     * Get store information.
     */
    public function getStoreInfo(): array
    {
        return $this->makeRequest('GET', '/v2/store');
    }

    /**
     * Get category trees.
     */
    public function getCategoryTrees(): array
    {
        $response = $this->makeRequest('GET', '/v3/catalog/trees');
        return $response['data'] ?? [];
    }
}
