<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryComparisonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'summary' => $this->resource['summary'] ?? [],
            'missing' => $this->formatCategories($this->resource['missing'] ?? [], 'missing'),
            'deleted' => $this->formatCategories($this->resource['deleted'] ?? [], 'deleted'),
            'updated' => $this->formatUpdatedCategories($this->resource['updated'] ?? []),
            'unchanged' => $this->formatCategories($this->resource['unchanged'] ?? [], 'unchanged'),
        ];
    }

    /**
     * Format category list with status.
     */
    private function formatCategories(array $categories, string $status): array
    {
        return array_map(function ($category) use ($status) {
            return [
                'id' => $category['id'] ?? null,
                'name' => $category['name'] ?? '',
                'path' => $category['path'] ?? '',
                'parent_id' => $category['parent_id'] ?? 0,
                'status' => $status,
                'custom_url' => $category['data']['custom_url']['url'] ?? '',
                'is_visible' => $category['data']['is_visible'] ?? true,
            ];
        }, $categories);
    }

    /**
     * Format updated categories with changes.
     */
    private function formatUpdatedCategories(array $categories): array
    {
        return array_map(function ($category) {
            return [
                'source_id' => $category['source']['id'] ?? null,
                'target_id' => $category['target']['id'] ?? null,
                'name' => $category['source']['name'] ?? '',
                'path' => $category['path'] ?? '',
                'status' => 'updated',
                'changes' => $this->formatChanges($category['changes'] ?? []),
                'source_data' => $category['source'] ?? [],
                'target_data' => $category['target'] ?? [],
            ];
        }, $categories);
    }

    /**
     * Format field changes.
     */
    private function formatChanges(array $changes): array
    {
        $formatted = [];

        foreach ($changes as $field => $change) {
            $formatted[] = [
                'field' => $field,
                'source_value' => $change['source'] ?? null,
                'target_value' => $change['target'] ?? null,
            ];
        }

        return $formatted;
    }
}
