<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get list of pending users awaiting approval
     * GET /api/admin/pending
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listPendingUsers(Request $request)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Get all users with 'pending' status
        $pendingUsers = User::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'status', 'created_at']);

        return response()->json([
            'users' => $pendingUsers,
        ], 200);
    }

    /**
     * Approve a pending user
     * POST /api/admin/approve/{id}
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approveUser(Request $request, $id)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Check if user is already active
        if ($user->status === 'active') {
            return response()->json([
                'message' => 'User is already active.',
            ], 400);
        }

        // Update user status to 'active'
        $user->status = 'active';
        $user->save();

        return response()->json([
            'message' => 'User approved successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
            ],
        ], 200);
    }

    /**
     * Get all users (for admin dashboard)
     * GET /api/admin/users
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listAllUsers(Request $request)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Get all users
        $users = User::orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'status', 'role', 'created_at']);

        return response()->json([
            'users' => $users,
        ], 200);
    }

    /**
     * Reject/deactivate a user
     * POST /api/admin/reject/{id}
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function rejectUser(Request $request, $id)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Update user status to 'inactive'
        $user->status = 'inactive';
        $user->save();

        return response()->json([
            'message' => 'User rejected successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
            ],
        ], 200);
    }

    /**
     * Update a user
     * PUT /api/admin/users/{id}
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUser(Request $request, $id)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Validate the request data
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'role' => 'sometimes|required|in:user,admin',
            'status' => 'sometimes|required|in:active,pending,inactive',
        ]);

        // Update user with validated data
        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ], 200);
    }

    /**
     * Delete a user
     * DELETE /api/admin/users/{id}
     * Protected route (requires auth:sanctum and admin role)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUser(Request $request, $id)
    {
        // Check if authenticated user is an admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Prevent admin from deleting themselves
        if ($request->user()->id == $id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 400);
        }

        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Delete the user
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ], 200);
    }
}
