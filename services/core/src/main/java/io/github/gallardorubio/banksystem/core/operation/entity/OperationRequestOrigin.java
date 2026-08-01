package io.github.gallardorubio.banksystem.core.operation.entity;

import org.springframework.security.oauth2.jwt.Jwt;

import jakarta.servlet.http.HttpServletRequest;

public record OperationRequestOrigin(
    String ip, 
    String userAgent, 
    String country, 
    String city
) {
    public static OperationRequestOrigin fromRequestAndJwt(HttpServletRequest request, Jwt jwt) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        } else if (ip.contains(",")) {
            ip = ip.split(",")[0].trim(); // Primera IP de la cadena (el cliente original)
        }

        String userAgent = request.getHeader("User-Agent");

        String country = request.getHeader("CloudFront-Viewer-Country");
        if (country == null && jwt != null && jwt.hasClaim("custom:country")) {
            country = jwt.getClaimAsString("custom:country");
        }

        String city = request.getHeader("CloudFront-Viewer-City");
        if (city == null && jwt != null && jwt.hasClaim("custom:city")) {
            city = jwt.getClaimAsString("custom:city");
        }

        return new OperationRequestOrigin(ip, userAgent, country, city);
    }
}