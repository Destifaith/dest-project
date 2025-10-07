<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Upload Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Menu Upload Login</h1>
            <p class="text-gray-600 mt-2">Enter your eatery credentials to upload today's menu</p>
        </div>

        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                @foreach ($errors->all() as $error)
                    <p>{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('menu.login.submit') }}">
            @csrf
            <input type="hidden" name="eatery_id" value="{{ $eatery_id }}">
            <input type="hidden" name="date" value="{{ $date }}">

            <div class="mb-4">
                <label for="eatery_name" class="block text-sm font-medium text-gray-700 mb-2">
                    Eatery Name
                </label>
                <input type="text" id="eatery_name" name="eatery_name"
                    value="{{ old('eatery_name', $eatery->name ?? '') }}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required autofocus placeholder="Enter your eatery name">
            </div>

            <div class="mb-6">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    Menu Password
                </label>
                <input type="password" id="password" name="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required placeholder="Enter your menu password">
            </div>

            <button type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                Login to Upload Menu
            </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
            <p>Need help? Contact support.</p>
        </div>
    </div>
</body>

</html>
