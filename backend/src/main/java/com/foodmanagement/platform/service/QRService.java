package com.foodmanagement.platform.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class QRService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String generateQRCodeHash() {
        return UUID.randomUUID().toString();
    }

    public String generateQRCodeImage(String hash) {
        try {
            int width = 250;
            int height = 250;
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(hash, BarcodeFormat.QR_CODE, width, height);

            // Ensure directory exists
            File dir = new File(uploadDir + "/qr");
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = "qr_" + hash + ".png";
            Path path = Paths.get(uploadDir + "/qr/" + fileName);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);

            // Return path relative to context path
            return "uploads/qr/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code image", e);
        }
    }
}
