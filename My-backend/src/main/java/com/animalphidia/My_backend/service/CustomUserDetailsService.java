package com.animalphidia.My_backend.service;

import com.animalphidia.My_backend.model.User;
import com.animalphidia.My_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Find user by username OR email
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(usernameOrEmail);

        if (userOptional.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username/email: " + usernameOrEmail);
        }

        User user = userOptional.get();

        // Check if account is active
        if (!user.getAccountStatus() || !user.getActive()) {
            throw new UsernameNotFoundException("User account is inactive or locked: " + usernameOrEmail);
        }

        // Create authorities based on user role
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}
