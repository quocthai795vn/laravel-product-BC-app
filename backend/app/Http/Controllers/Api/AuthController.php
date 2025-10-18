<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     * POST /api/register
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // Validate incoming request
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create user with 'pending' status by default
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'pending', // User cannot login until admin approves
            'role' => 'user',
        ]);

        return response()->json([
            'message' => 'Registration successful. Your account is pending approval.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
            ],
        ], 201);
    }

    /**
     * Login user and return token
     * POST /api/login
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate login credentials
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address.',
                'errors' => [
                    'email' => ['No account found with this email address.']
                ]
            ], 422);
        }

        // Check if password is correct
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password. Please try again.',
                'errors' => [
                    'password' => ['Incorrect password. Please try again.']
                ]
            ], 422);
        }

        // Check if user status is 'active'
        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Your account is pending admin approval. Please wait for confirmation.',
                'errors' => [
                    'email' => ['Your account is pending admin approval.']
                ]
            ], 403);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
                'errors' => [
                    'email' => ['Your account has been deactivated.']
                ]
            ], 403);
        }

        // Create Sanctum token for the user
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
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
     * Get authenticated user information
     * GET /api/user
     * Protected route (requires auth:sanctum middleware)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser(Request $request)
    {
        // Return authenticated user from request
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'status' => $request->user()->status,
            ],
        ], 200);
    }

    /**
     * Logout user and revoke token
     * POST /api/logout
     * Protected route (requires auth:sanctum middleware)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }
}
