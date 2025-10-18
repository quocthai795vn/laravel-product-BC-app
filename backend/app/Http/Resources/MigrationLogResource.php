<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MigrationLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source_store' => new StoreConnectionResource($this->whenLoaded('sourceStore')),
            'target_store' => new StoreConnectionResource($this->whenLoaded('targetStore')),
            'categories_count' => $this->categories_count,
            'status' => $this->status,
            'duration' => $this->duration,
            'duration_formatted' => $this->duration ? $this->formatDuration($this->duration) : null,
            'results' => $this->results,
            'details' => $this->when($request->get('include_details'), $this->details),
            'error_message' => $this->error_message,
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    /**
     * Format duration in human-readable format.
     */
    private function formatDuration(int $seconds): string
    {
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($minutes > 0) {
            return "{$minutes}m {$remainingSeconds}s";
        }

        return "{$remainingSeconds}s";
    }
}
