<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('migration_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_store_id')->constrained('store_connections')->onDelete('cascade');
            $table->foreignId('target_store_id')->constrained('store_connections')->onDelete('cascade');
            $table->integer('categories_count')->default(0);
            $table->enum('status', ['pending', 'in_progress', 'completed', 'failed', 'partial'])->default('pending');
            $table->integer('duration')->nullable(); // in seconds
            $table->json('results')->nullable(); // { created: 10, updated: 5, skipped: 2, failed: 1 }
            $table->json('details')->nullable(); // Detailed log of each category
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('migration_logs');
    }
};
