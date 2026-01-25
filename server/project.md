📄 Freelancing Platform – Backend Requirement Document

Tech Stack: Java 21, Spring Boot, Spring Security, PostgreSQL
Architecture: Modular Monolith → Microservices Ready
Pattern: Layered Architecture (Controller → Service → Repository → DB)

1. Project Overview

Build a freelancing marketplace platform similar to Fiverr / Upwork, where:

Clients can register and hire freelancers

Freelancers can create multiple gigs with fixed pricing

The system is designed as a modular monolith, allowing easy migration to microservices in the future

2. Architecture Requirements
   2.1 Architectural Principles

Layered Architecture

controller → service → repository → database

Modular Architecture

Each domain is isolated (Auth, User, Freelancer, Gig, Client)

No cross-module direct DB access

Future Microservices Ready

Each module should be independently extractable

Use interfaces at service boundaries

Stateless APIs

RESTful API Design

3. High-Level Modules
   com.platform
   ├── auth
   ├── user
   ├── freelancer
   ├── client
   ├── gig
   ├── common
   └── config

4. Common Functionalities (Client & Freelancer)
   4.1 Authentication & Authorization
   Functionalities

User Registration

User Login

JWT-based authentication

Role-based access control

User Roles

CLIENT

FREELANCER

Constraints

Email must be unique

Password encrypted using BCrypt

No profile image required

4.2 Profile Management (Common)
Functionalities

Update Profile

Fetch Profile

Fields

Full Name

Email (read-only)

Phone (optional)

Bio (optional)

Role (CLIENT / FREELANCER)

5. Freelancer Functionalities
   5.1 Freelancer Account

A user with role FREELANCER

One-to-one relationship with User

Freelancer Fields

User ID (FK)

Title (e.g., “Full Stack Developer”)

Skills (list of strings)

Social Links (JSON)

LinkedIn

GitHub

Portfolio URL

5.2 Gig Management
Core Rules

Freelancer can create multiple gigs

Each gig:

Has fixed price only

No hourly pricing

Max 3 images

Belongs to one freelancer

5.3 Gig Functionalities
Create Gig

Freelancer creates a gig

Update Gig

Freelancer updates own gig

Delete Gig

Soft delete preferred

Fetch Gigs

Public listing

Filter by skill / price range

5.4 Gig Fields (Corrected ER)

❌ Remove hourly_rate from ER
✅ Use only fixed_price

Gig Entity Fields

ID

Freelancer ID (FK)

Title

Description

Fixed Price (BigDecimal)

Skills (List<String>)

Status (ACTIVE / INACTIVE)

Created At

Updated At

5.5 Gig Images
Rules

Max 3 images per gig

Image stored as URL (S3-ready)

Separate table

Gig Image Fields

ID

Gig ID (FK)

Image URL

Display Order

6. Client Functionalities (Minimal – Phase 1)

Client functionality is intentionally limited for MVP.

Client Profile

One-to-one with User

No extra attributes initially

7. Database Design (ER – Corrected)
   7.1 Key ER Fixes
   Issue in ER Fix
   Hourly Rate ❌ Remove
   Gig pricing ✅ Fixed price only
   Skills Store as JSONB or join table
   Social links JSONB
   Images Separate table
   7.2 Core Tables
   users
   id (PK)
   email (unique)
   password
   role
   created_at
   updated_at

freelancers
id (PK)
user_id (FK)
title
skills (JSONB)
social_links (JSONB)

clients
id (PK)
user_id (FK)

gigs
id (PK)
freelancer_id (FK)
title
description
fixed_price
skills (JSONB)
status
created_at
updated_at

gig_images
id (PK)
gig_id (FK)
image_url
display_order

8. API Design Guidelines
   Naming Convention

/api/v1/auth/\*

/api/v1/freelancers/\*

/api/v1/gigs/\*

Example APIs
Auth

POST /auth/register

POST /auth/login

Freelancer

GET /freelancers/me

PUT /freelancers/me

Gig

POST /gigs

PUT /gigs/{id}

DELETE /gigs/{id}

GET /gigs

GET /gigs/{id}

9. Security Requirements

JWT Authentication

Role-based access

Freelancer can only modify own gigs

Client can only read gigs

10. Coding Guidelines (For Copilot)

DTO-based request/response

MapStruct for entity mapping

Validation using @Valid

Global exception handling

Pagination using Spring Pageable

No business logic in controllers

11. Future Microservices Split (Planned)
    Module Future Service
    Auth auth-service
    User user-service
    Freelancer freelancer-service
    Gig gig-service
12. Non-Functional Requirements

Clean code

SOLID principles

OpenAPI (Swagger)

DB migrations via Flyway

Logging using SLF4J

13. Explicit Instructions for Copilot

Generate production-grade Spring Boot code
Follow layered + modular architecture
Use PostgreSQL + JPA
Do not include hourly pricing
Follow ER fixes mentioned above

Not: As of now 3 images per gig is completely optional and its not mandatory for users to upload!
