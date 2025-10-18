<?php

namespace App\Services;

class CategoryMappingService
{
    /**
     * Build hierarchical path for a category.
     * Example: "Wine -> Red -> Cabernet Sauvignon"
     */
    public function buildCategoryPath(array $categories, int $categoryId): string
    {
        $path = [];
        $currentId = $categoryId;
        $visited = [];

        while ($currentId && $currentId != 0) {
            // Prevent infinite loops
            if (isset($visited[$currentId])) {
                break;
            }
            $visited[$currentId] = true;

            $found = false;
            foreach ($categories as $cat) {
                $id = $cat['id'] ?? ($cat['category_id'] ?? null);

                if ($id == $currentId) {
                    array_unshift($path, $cat['name']);
                    $currentId = $cat['parent_id'] ?? 0;
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                break;
            }
        }

        return implode(' -> ', $path);
    }

    /**
     * Build a map of categories indexed by their hierarchical path.
     * Handles both regular categories (id) and tree categories (category_id).
     */
    public function buildPathMap(array $categories, bool $isNewStore = false): array
    {
        $pathMap = [];

        foreach ($categories as $cat) {
            // Handle both 'id' and 'category_id' formats
            $catId = $cat['category_id'] ?? $cat['id'] ?? null;

            if (!$catId) {
                continue; // Skip categories without an ID
            }

            $path = $this->buildCategoryPath($categories, $catId);

            $pathMap[$path] = [
                'id' => $catId,
                'name' => $cat['name'] ?? '',
                'parent_id' => $cat['parent_id'] ?? 0,
                'data' => $cat,
            ];
        }

        return $pathMap;
    }

    /**
     * Extract detailed category information.
     * Handles both /v3/catalog/categories and /v3/catalog/trees/categories formats.
     */
    public function extractCategoryInfo(array $category, array $allCategories, bool $isNewStore = false): array
    {
        // Handle both 'id' (regular categories) and 'category_id' (tree categories)
        $catId = $category['category_id'] ?? $category['id'] ?? null;
        $path = $this->buildCategoryPath($allCategories, $catId);

        // Handle both 'custom_url' (regular) and 'url' (tree) formats
        $customUrl = '';
        if (isset($category['custom_url']['url'])) {
            $customUrl = $category['custom_url']['url'];
        } elseif (isset($category['url']['path'])) {
            $customUrl = $category['url']['path'];
        }

        return [
            'id' => $catId,
            'name' => $category['name'] ?? '',
            'description' => $category['description'] ?? '',
            'custom_url' => $customUrl,
            'page_title' => $category['page_title'] ?? '',
            'meta_keywords' => $category['meta_keywords'] ?? [],
            'meta_description' => $category['meta_description'] ?? '',
            'search_keywords' => $category['search_keywords'] ?? '',
            'sort_order' => $category['sort_order'] ?? 0,
            'is_visible' => $category['is_visible'] ?? true,
            'parent_id' => $category['parent_id'] ?? 0,
            'image_url' => $category['image_url'] ?? '',
            'default_product_sort' => $category['default_product_sort'] ?? 'use_store_settings',
            'layout_file' => $category['layout_file'] ?? '',
            'path' => $path,
        ];
    }

    /**
     * Sort categories by parent_id (parents first).
     */
    public function sortByParentId(array $categories, bool $descending = false): array
    {
        usort($categories, function ($a, $b) use ($descending) {
            $parentA = $a['parent_id'] ?? 0;
            $parentB = $b['parent_id'] ?? 0;

            return $descending ? $parentB <=> $parentA : $parentA <=> $parentB;
        });

        return $categories;
    }

    /**
     * Normalize category data for comparison.
     */
    public function normalizeValue($value): mixed
    {
        if (is_string($value)) {
            return trim($value);
        }

        if (is_array($value)) {
            sort($value);
        }

        return $value;
    }
}
