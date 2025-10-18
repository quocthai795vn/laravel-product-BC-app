<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MigrationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_store_id',
        'target_store_id',
        'categories_count',
        'status',
        'duration',
        'results',
        'details',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'results' => 'array',
        'details' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the migration log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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
     * Scope a query to only include completed migrations.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include failed migrations.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include in-progress migrations.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Mark the migration as started.
     */
    public function markAsStarted(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark the migration as completed.
     */
    public function markAsCompleted(array $results): void
    {
        $duration = $this->started_at ? now()->diffInSeconds($this->started_at) : null;

        $this->update([
            'status' => 'completed',
            'results' => $results,
            'duration' => $duration,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the migration as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $duration = $this->started_at ? now()->diffInSeconds($this->started_at) : null;

        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'duration' => $duration,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the migration as partial (some succeeded, some failed).
     */
    public function markAsPartial(array $results): void
    {
        $duration = $this->started_at ? now()->diffInSeconds($this->started_at) : null;

        $this->update([
            'status' => 'partial',
            'results' => $results,
            'duration' => $duration,
            'completed_at' => now(),
        ]);
    }

    /**
     * Update migration progress with current results.
     */
    public function updateProgress(array $results, array $details = []): void
    {
        $this->update([
            'results' => $results,
            'details' => $details,
        ]);
    }
}
