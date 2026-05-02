<?php
// Send email via Gmail SMTP using PHP's built-in mail() or PHPMailer
// Uses PHPMailer (installed via composer)

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendMail(string $to, string $subject, string $htmlBody): void {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['EMAIL_USER'] ?? '';
    $mail->Password   = $_ENV['EMAIL_PASS'] ?? '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom($_ENV['EMAIL_USER'] ?? '', 'GetReach Support');
    $mail->addAddress($to);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $htmlBody;
    $mail->send();
}
