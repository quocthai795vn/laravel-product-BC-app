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
        Schema::create('category_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_store_id')->constrained('store_connections')->onDelete('cascade');
            $table->foreignId('target_store_id')->constrained('store_connections')->onDelete('cascade');
            $table->integer('old_category_id');
            $table->integer('new_category_id');
            $table->string('category_name');
            $table->text('category_path'); // Full hierarchical path
            $table->integer('parent_id')->default(0);
            $table->json('metadata')->nullable(); // Store additional mapping info
            $table->timestamps();

            // Indexes
            $table->index(['source_store_id', 'old_category_id']);
            $table->index(['target_store_id', 'new_category_id']);
            $table->unique(['source_store_id', 'target_store_id', 'old_category_id'], 'unique_mapping');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_mappings');
    }
};
