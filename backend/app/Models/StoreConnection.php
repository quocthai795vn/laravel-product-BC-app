<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'store_hash',
        'access_token',
        'type',
        'tree_id',
        'tree_name',
        'is_active',
        'last_connected_at',
        'metadata',
    ];

    protected $casts = [
        'access_token' => 'encrypted',
        'is_active' => 'boolean',
        'last_connected_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected $hidden = [
        'access_token',
    ];

    /**
     * Get the user that owns the store connection.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category mappings for this store as source.
     */
    public function sourceMappings(): HasMany
    {
        return $this->hasMany(CategoryMapping::class, 'source_store_id');
    }

    /**
     * Get the category mappings for this store as target.
     */
    public function targetMappings(): HasMany
    {
        return $this->hasMany(CategoryMapping::class, 'target_store_id');
    }

    /**
     * Get the migration logs where this store is the source.
     */
    public function sourceMigrations(): HasMany
    {
        return $this->hasMany(MigrationLog::class, 'source_store_id');
    }

    /**
     * Get the migration logs where this store is the target.
     */
    public function targetMigrations(): HasMany
    {
        return $this->hasMany(MigrationLog::class, 'target_store_id');
    }

    /**
     * Scope a query to only include active stores.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include source stores.
     */
    public function scopeSource($query)
    {
        return $query->where('type', 'source');
    }

    /**
     * Scope a query to only include target stores.
     */
    public function scopeTarget($query)
    {
        return $query->where('type', 'target');
    }

    /**
     * Mark this connection as recently connected.
     */
    public function markAsConnected(): void
    {
        $this->update(['last_connected_at' => now()]);
    }
}
