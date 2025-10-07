<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Menu Update Request</title>
</head>

<body
    style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px;">
    <h2 style="color: #2563eb;">Hello {{ $eatery->owner_full_name ?? 'Owner' }},</h2>
    <p>Please upload today's menu for <strong>{{ $eatery->name }}</strong>.</p>

    <div
        style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">
            <strong>Your Login Credentials:</strong><br>
            Eatery Name: <strong>{{ $eatery->name }}</strong><br>
            Password: <strong>{{ $eatery->menu_password }}</strong>
        </p>
    </div>

    <p>
        <a href="{{ route('menu.login', ['eatery_id' => $eatery->id, 'date' => $menuDate]) }}"
            style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📝 Upload Today's Menu
        </a>
    </p>

    <p style="font-size: 14px; color: #64748b;">
        <em>Use the credentials above to login and upload your menu.</em>
    </p>

    <p>This menu will be displayed on your eatery page for customers to view and reserve.</p>

    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">

    <p style="font-size: 14px; color: #777;">
        Thanks,<br>
        {{ config('app.name') }}
    </p>
</body>

</html>
