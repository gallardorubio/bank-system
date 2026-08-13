package io.github.gallardorubio.banksystem.core.config;

import io.github.gallardorubio.banksystem.core.client.dao.ClientRepository;
import io.github.gallardorubio.banksystem.core.client.entity.ClientAccountStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClientStatusFilter extends OncePerRequestFilter {

    private final ClientRepository clientRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            
            boolean isClient = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_client"));

            if (isClient) {
                String path = request.getRequestURI();

                boolean isUnlockAllowed = path.endsWith("/clients/security-questions") ||
                                        path.endsWith("/clients/me/security-questions") ||
                                          path.endsWith("/clients/unlock");

                if (!isUnlockAllowed) {
                    UUID clientId = UUID.fromString(jwt.getSubject());
                    
                    boolean isActive = clientRepository.findById(clientId)
                            .map(client -> client.getAccountStatus() == ClientAccountStatus.ACTIVE)
                            .orElse(false);

                    if (!isActive) {
                        response.sendError(HttpServletResponse.SC_FORBIDDEN);
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

}
