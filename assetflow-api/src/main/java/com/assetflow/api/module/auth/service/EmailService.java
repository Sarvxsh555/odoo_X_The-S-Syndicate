package com.assetflow.api.module.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@assetflow.com}")
    private String fromEmail;

    @Value("${app.email.from-name:AssetFlow System}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            String subject = "AssetFlow — Password Reset Request";
            String body = buildPasswordResetEmailBody(resetLink);
            sendHtmlEmail(toEmail, subject, body);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            String subject = "Welcome to AssetFlow!";
            String body = buildWelcomeEmailBody(firstName);
            sendHtmlEmail(toEmail, subject, body);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String message) {
        try {
            sendHtmlEmail(toEmail, subject, buildNotificationBody(subject, message));
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
        log.info("Email sent to {} with subject: {}", to, subject);
    }

    private String buildPasswordResetEmailBody(String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">
                  <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:40px;">
                    <h2 style="color:#6366f1;">AssetFlow</h2>
                    <h3>Password Reset Request</h3>
                    <p>You requested to reset your password. Click the button below:</p>
                    <a href="%s" style="display:inline-block; padding:12px 24px; background:#6366f1; color:#fff;
                       border-radius:6px; text-decoration:none; margin:16px 0;">Reset Password</a>
                    <p style="color:#888; font-size:12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                  </div>
                </body>
                </html>
                """.formatted(resetLink);
    }

    private String buildWelcomeEmailBody(String firstName) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">
                  <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:40px;">
                    <h2 style="color:#6366f1;">Welcome to AssetFlow, %s!</h2>
                    <p>Your account has been created. You can now log in and start managing assets.</p>
                    <a href="%s/login" style="display:inline-block; padding:12px 24px; background:#6366f1; color:#fff;
                       border-radius:6px; text-decoration:none;">Go to AssetFlow</a>
                  </div>
                </body>
                </html>
                """.formatted(firstName, frontendUrl);
    }

    private String buildNotificationBody(String title, String message) {
        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:40px;">
                  <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:40px;">
                    <h2 style="color:#6366f1;">AssetFlow</h2>
                    <h3>%s</h3>
                    <p>%s</p>
                  </div>
                </body>
                </html>
                """.formatted(title, message);
    }
}
