package com.project.freelance.freelancing_platform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "clients")
public class Client {
    @Id
    private Long clientId; // maps to users.user_id

    @OneToOne
    @MapsId
    @JoinColumn(name = "client_id")
    private User user;

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
