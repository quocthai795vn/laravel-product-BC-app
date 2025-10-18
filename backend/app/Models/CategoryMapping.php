<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_store_id',
        'target_store_id',
        'old_category_id',
        'new_category_id',
        'category_name',
        'category_path',
        'parent_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the source store.
     */
    public function sourceStore(): BelongsTo
    {
        return $this->belongsTo(StoreConnection::class, 'source_store_id');
    }

    /**
     * Get the target store.
     */
    public function targetStore(): BelongsTo
    {
        return $this->belongsTo(StoreConnection::class, 'target_store_id');
    }

    /**
     * Find mapping by old category ID.
     */
    public static function findByOldCategoryId(int $sourceStoreId, int $targetStoreId, int $oldCategoryId): ?self
    {
        return self::where('source_store_id', $sourceStoreId)
            ->where('target_store_id', $targetStoreId)
            ->where('old_category_id', $oldCategoryId)
            ->first();
    }

    /**
     * Get new category ID for an old category ID.
     */
    public static function getNewCategoryId(int $sourceStoreId, int $targetStoreId, int $oldCategoryId): ?int
    {
        $mapping = self::findByOldCategoryId($sourceStoreId, $targetStoreId, $oldCategoryId);
        return $mapping?->new_category_id;
    }

    /**
     * Create or update a mapping.
     */
    public static function createOrUpdateMapping(
        int $sourceStoreId,
        int $targetStoreId,
        int $oldCategoryId,
        int $newCategoryId,
        string $categoryName,
        string $categoryPath,
        int $parentId = 0,
        array $metadata = []
    ): self {
        return self::updateOrCreate(
            [
                'source_store_id' => $sourceStoreId,
                'target_store_id' => $targetStoreId,
                'old_category_id' => $oldCategoryId,
            ],
            [
                'new_category_id' => $newCategoryId,
                'category_name' => $categoryName,
                'category_path' => $categoryPath,
                'parent_id' => $parentId,
                'metadata' => $metadata,
            ]
        );
    }

    /**
     * Get all mappings for a store pair.
     */
    public static function getAllMappings(int $sourceStoreId, int $targetStoreId): array
    {
        return self::where('source_store_id', $sourceStoreId)
            ->where('target_store_id', $targetStoreId)
            ->get()
            ->pluck('new_category_id', 'old_category_id')
            ->toArray();
    }
}
