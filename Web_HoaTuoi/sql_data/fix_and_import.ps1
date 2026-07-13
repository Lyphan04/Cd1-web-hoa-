# Paths
$reviewsPath = "d:\lypflower\Web-HoaTuoi - Copy\Web_HoaTuoi\sql_data\sql_source\Reviews.sql"
$userPath = "d:\lypflower\Web-HoaTuoi - Copy\Web_HoaTuoi\sql_data\sql_source\USER.sql"
$ordersPath = "d:\lypflower\Web-HoaTuoi - Copy\Web_HoaTuoi\sql_data\sql_source\Orders.sql"
$orderDetailsPath = "d:\lypflower\Web-HoaTuoi - Copy\Web_HoaTuoi\sql_data\sql_source\OrderDetails.sql"

# Clean tables first
sqlcmd -S "(localdb)\MSSQLLocalDB" -d "WebHoaTuoiDb" -Q "DELETE FROM Reviews; DELETE FROM OrderDetails; DELETE FROM Orders; DELETE FROM [USER];"

# 1. Fix Reviews.sql
Write-Host "Fixing Reviews.sql..."
$reviewsContent = Get-Content -Path $reviewsPath -Raw
if (-not $reviewsContent.Contains("SET IDENTITY_INSERT Reviews ON")) {
    $reviewsContent = "SET IDENTITY_INSERT Reviews ON;`r`nGO`r`n" + $reviewsContent + "`r`nSET IDENTITY_INSERT Reviews OFF;`r`nGO"
    Set-Content -Path $reviewsPath -Value $reviewsContent -Encoding utf8
}

# 2. Fix USER.sql
Write-Host "Fixing USER.sql..."
$userContent = Get-Content -Path $userPath -Raw
$userContent = $userContent -replace 'insert into USER ', 'insert into [USER] '
$userContent = $userContent -replace 'SET IDENTITY_INSERT Users ON;', ''
$userContent = $userContent -replace 'SET IDENTITY_INSERT Users OFF;', ''
Set-Content -Path $userPath -Value $userContent -Encoding utf8

# 3. Run imports one by one
Write-Host "Importing USER.sql..."
sqlcmd -S "(localdb)\MSSQLLocalDB" -d "WebHoaTuoiDb" -i $userPath -b

Write-Host "Importing Orders.sql..."
sqlcmd -S "(localdb)\MSSQLLocalDB" -d "WebHoaTuoiDb" -i $ordersPath -b

Write-Host "Importing OrderDetails.sql..."
sqlcmd -S "(localdb)\MSSQLLocalDB" -d "WebHoaTuoiDb" -i $orderDetailsPath -b

Write-Host "Importing Reviews.sql..."
sqlcmd -S "(localdb)\MSSQLLocalDB" -d "WebHoaTuoiDb" -i $reviewsPath -b

Write-Host "Import complete!"
