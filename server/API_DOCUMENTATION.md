# Freelancing Platform API Documentation

## Base URL

```
http://localhost:8080
```

## Authentication

The API uses JWT token authentication. Include the JWT token in requests using either:

1. **HTTP-only Cookie** (Recommended): `AUTH_TOKEN=<token>`
2. **Authorization Header** (Fallback): `Authorization: Bearer <token>`

---

## Authentication Endpoints

### 1. Register User

**POST** `/api/v1/auth/register`

Creates a new user account (CLIENT or FREELANCER).

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "role": "FREELANCER",
  "title": "Full Stack Developer",
  "description": "Experienced developer with 5+ years in web development"
}
```

**Fields:**

- `email` (required): User's email address
- `password` (required): User's password
- `fullName` (required): Will be split into firstName/lastName
- `phoneNumber` (optional): Contact number
- `role` (required): Either "CLIENT" or "FREELANCER"
- `title` (optional): Professional title (for freelancers)
- `description` (optional): Professional description (for freelancers)

**Response:**

```json
{
  "message": "User registered successfully",
  "userId": 1,
  "email": "john.doe@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Cookies Set:** `AUTH_TOKEN` (HTTP-only, 24hr expiry)

---

### 2. Login User

**POST** `/api/v1/auth/login`

Authenticates user and returns JWT token.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "userId": 1,
  "email": "john.doe@example.com",
  "role": "FREELANCER",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Cookies Set:** `AUTH_TOKEN` (HTTP-only, 24hr expiry)

---

### 3. Logout User

**POST** `/api/v1/auth/logout`

Clears authentication token.

**Request:** No body required

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:** `AUTH_TOKEN`

---

### 4. Get Current User

**GET** `/api/v1/auth/me`

Returns current authenticated user information.

**Authorization:** Required (any role)

**Response:**

```json
{
  "userId": 1,
  "email": "john.doe@example.com",
  "fullName": "John Doe",
  "role": "FREELANCER"
}
```

---

## Requirements Endpoints

### 1. Create Requirement

**POST** `/api/v1/requirements`

Creates a new job requirement (CLIENT only).

**Authorization:** Required (CLIENT role)

**Request Body:**

```json
{
  "title": "Build E-commerce Website",
  "description": "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
  "minPrice": 5000.0,
  "maxPrice": 10000.0,
  "skills": ["React", "Spring Boot", "PostgreSQL", "Docker"],
  "yoeRequired": 3
}
```

**Fields:**

- `title` (required): Job title
- `description` (required): Detailed job description
- `minPrice` (required): Minimum budget
- `maxPrice` (required): Maximum budget
- `skills` (required): Array of required skills
- `yoeRequired` (optional): Years of experience required

**Response:**

```json
{
  "id": 1,
  "clientId": 2,
  "clientName": "Jane Smith",
  "title": "Build E-commerce Website",
  "description": "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
  "minPrice": 5000.0,
  "maxPrice": 10000.0,
  "skills": ["React", "Spring Boot", "PostgreSQL", "Docker"],
  "yoeRequired": 3,
  "status": "OPEN",
  "createdAt": "2026-01-24T01:30:00Z",
  "totalProposals": 0
}
```

---

### 2. List Requirements (Freelancer View)

**GET** `/api/v1/requirements`

Lists all open requirements available for freelancers.

**Authorization:** Required (FREELANCER role)

**Query Parameters:**

- `page` (optional): Page number (0-based, default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field and direction (e.g., "createdAt,desc")

**Response:**

```json
{
  "content": [
    {
      "id": 1,
      "clientId": 2,
      "clientName": "Jane Smith",
      "title": "Build E-commerce Website",
      "description": "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
      "minPrice": 5000.0,
      "maxPrice": 10000.0,
      "skills": ["React", "Spring Boot", "PostgreSQL", "Docker"],
      "yoeRequired": 3,
      "status": "OPEN",
      "createdAt": "2026-01-24T01:30:00Z",
      "totalProposals": 5
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### 3. Get My Requirements (Client View)

**GET** `/api/v1/requirements/me`

Lists all requirements created by the current client.

**Authorization:** Required (CLIENT role)

**Response:**

```json
[
  {
    "id": 1,
    "clientId": 2,
    "clientName": "Jane Smith",
    "title": "Build E-commerce Website",
    "description": "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
    "minPrice": 5000.0,
    "maxPrice": 10000.0,
    "skills": ["React", "Spring Boot", "PostgreSQL", "Docker"],
    "yoeRequired": 3,
    "status": "OPEN",
    "createdAt": "2026-01-24T01:30:00Z",
    "totalProposals": 5
  }
]
```

---

### 4. Get Requirement Details

**GET** `/api/v1/requirements/{id}`

Gets detailed information about a specific requirement.

**Authorization:** Required (CLIENT or FREELANCER role)

**Path Parameters:**

- `id`: Requirement ID

**Response:**

```json
{
  "id": 1,
  "clientId": 2,
  "clientName": "Jane Smith",
  "title": "Build E-commerce Website",
  "description": "Need a full-stack developer to build a modern e-commerce platform with React and Spring Boot",
  "minPrice": 5000.0,
  "maxPrice": 10000.0,
  "skills": ["React", "Spring Boot", "PostgreSQL", "Docker"],
  "yoeRequired": 3,
  "status": "OPEN",
  "createdAt": "2026-01-24T01:30:00Z",
  "totalProposals": 5
}
```

---

### 5. Get Proposals for Requirement

**GET** `/api/v1/requirements/{id}/proposals`

Lists all proposals submitted for a specific requirement (CLIENT only).

**Authorization:** Required (CLIENT role)

**Path Parameters:**

- `id`: Requirement ID

**Response:**

```json
[
  {
    "id": 1,
    "requirementId": 1,
    "freelancerId": 3,
    "message": "I have 5+ years of experience with React and Spring Boot. I can deliver this project in 4 weeks.",
    "proposedPrice": 7500.0,
    "status": "PENDING",
    "createdAt": "2026-01-24T02:00:00Z"
  },
  {
    "id": 2,
    "requirementId": 1,
    "freelancerId": 4,
    "message": "Expert in full-stack development. Can complete this in 3 weeks with modern technologies.",
    "proposedPrice": 8000.0,
    "status": "PENDING",
    "createdAt": "2026-01-24T02:15:00Z"
  }
]
```

---

### 6. Close Requirement

**POST** `/api/v1/requirements/{id}/close`

Manually closes a requirement (CLIENT only).

**Authorization:** Required (CLIENT role)

**Path Parameters:**

- `id`: Requirement ID

**Response:**

```json
{
  "message": "closed"
}
```

---

## Proposals Endpoints

### 1. Submit Proposal

**POST** `/api/v1/requirements/{id}/proposals`

Submit a proposal for a specific requirement (FREELANCER only).

**Authorization:** Required (FREELANCER role)

**Path Parameters:**

- `id`: Requirement ID

**Request Body:**

```json
{
  "message": "I have 5+ years of experience with React and Spring Boot. I can deliver this project in 4 weeks.",
  "proposedPrice": 7500.0
}
```

**Fields:**

- `message` (required): Proposal message/cover letter
- `proposedPrice` (required): Proposed price for the project

**Response:**

```json
{
  "id": 1,
  "requirementId": 1,
  "freelancerId": 3,
  "message": "I have 5+ years of experience with React and Spring Boot. I can deliver this project in 4 weeks.",
  "proposedPrice": 7500.0,
  "status": "PENDING",
  "createdAt": "2026-01-24T02:00:00Z"
}
```

---

### 2. Accept Proposal

**POST** `/api/v1/proposals/{id}/accept`

Accept a proposal for a requirement (CLIENT only).

**Authorization:** Required (CLIENT role)

**Path Parameters:**

- `id`: Proposal ID

**Response:**

```json
{
  "id": 1,
  "requirementId": 1,
  "freelancerId": 3,
  "message": "I have 5+ years of experience with React and Spring Boot. I can deliver this project in 4 weeks.",
  "proposedPrice": 7500.0,
  "status": "ACCEPTED",
  "createdAt": "2026-01-24T02:00:00Z"
}
```

**Side Effects:**

- Proposal status changes to "ACCEPTED"
- All other proposals for the same requirement are automatically rejected
- Requirement status changes to "CLOSED"

---

### 3. Get My Proposals

**GET** `/api/v1/proposals/me`

Lists all proposals submitted by the current freelancer.

**Authorization:** Required (FREELANCER role)

**Response:**

```json
[
  {
    "id": 1,
    "requirementId": 1,
    "freelancerId": 3,
    "message": "I have 5+ years of experience with React and Spring Boot. I can deliver this project in 4 weeks.",
    "proposedPrice": 7500.0,
    "status": "ACCEPTED",
    "createdAt": "2026-01-24T02:00:00Z"
  },
  {
    "id": 2,
    "requirementId": 2,
    "freelancerId": 3,
    "message": "I can help with this mobile app development project.",
    "proposedPrice": 3000.0,
    "status": "PENDING",
    "createdAt": "2026-01-24T03:00:00Z"
  }
]
```

### 4. Get My Ongoing Jobs

**GET** `/api/v1/proposals/me/ongoing`

Lists all accepted proposals (ongoing jobs) for the current freelancer.

**Authorization:** Required (FREELANCER role)

**Response:**

```json
[
  {
    "id": 1,
    "requirementId": 1,
    "freelancerId": 3,
    "message": "I have 5+ years of experience with React and Spring Boot.",
    "proposedPrice": 7500.0,
    "status": "ACCEPTED",
    "createdAt": "2026-01-24T02:00:00Z",
    "requirementTitle": "Build E-commerce Website",
    "requirementDescription": "Need a full-stack developer...",
    "clientId": 2,
    "clientName": "Jane Smith",
    "completionNotes": null,
    "clientFeedback": null,
    "rejectionReason": null,
    "submittedAt": null,
    "completedAt": null
  }
]
```

---

### 5. Request Project Completion

**POST** `/api/v1/proposals/{id}/request-completion`

Request completion of a project by submitting deliverables (FREELANCER only).

**Authorization:** Required (FREELANCER role)

**Path Parameters:**

- `id`: Proposal ID

**Request Body:**

```json
{
  "completionNotes": "Project completed successfully. All features implemented and tested.",
  "deliverableLinks": "https://github.com/freelancer/project-repo"
}
```

**Fields:**

- `completionNotes` (required): Notes about the completed work
- `deliverableLinks` (optional): Links to project deliverables

**Response:**

```json
{
  "id": 1,
  "requirementId": 1,
  "freelancerId": 3,
  "message": "I have 5+ years of experience with React and Spring Boot.",
  "proposedPrice": 7500.0,
  "status": "COMPLETION_REQUESTED",
  "createdAt": "2026-01-24T02:00:00Z",
  "completionNotes": "Project completed successfully. All features implemented and tested.",
  "submittedAt": "2026-01-25T10:00:00Z",
  "requirementTitle": "Build E-commerce Website",
  "clientId": 2,
  "clientName": "Jane Smith"
}
```

---

### 6. Approve Project Completion

**POST** `/api/v1/proposals/{id}/approve-completion`

Approve completed project and provide feedback (CLIENT only).

**Authorization:** Required (CLIENT role)

**Path Parameters:**

- `id`: Proposal ID

**Request Body:**

```json
{
  "feedback": "Excellent work! All requirements met and delivered on time.",
  "rating": 5
}
```

**Fields:**

- `feedback` (required): Client feedback on the work
- `rating` (optional): Rating from 1-5

**Response:**

```json
{
  "id": 1,
  "requirementId": 1,
  "freelancerId": 3,
  "message": "I have 5+ years of experience with React and Spring Boot.",
  "proposedPrice": 7500.0,
  "status": "COMPLETED",
  "createdAt": "2026-01-24T02:00:00Z",
  "completionNotes": "Project completed successfully. All features implemented and tested.",
  "clientFeedback": "Excellent work! All requirements met and delivered on time.",
  "submittedAt": "2026-01-25T10:00:00Z",
  "completedAt": "2026-01-25T12:00:00Z",
  "requirementTitle": "Build E-commerce Website",
  "clientId": 2,
  "clientName": "Jane Smith"
}
```

---

### 7. Reject Project Completion

**POST** `/api/v1/proposals/{id}/reject-completion`

Reject completed project and request changes (CLIENT only).

**Authorization:** Required (CLIENT role)

**Path Parameters:**

- `id`: Proposal ID

**Request Body:**

```json
{
  "feedback": "The mobile responsiveness needs improvement.",
  "requestedChanges": "Please fix mobile layout issues and add responsive design for tablets."
}
```

**Fields:**

- `feedback` (required): Why the work is not acceptable
- `requestedChanges` (required): What needs to be changed

**Response:**

```json
{
  "id": 1,
  "requirementId": 1,
  "freelancerId": 3,
  "message": "I have 5+ years of experience with React and Spring Boot.",
  "proposedPrice": 7500.0,
  "status": "REVISION_REQUESTED",
  "createdAt": "2026-01-24T02:00:00Z",
  "completionNotes": "Project completed successfully. All features implemented and tested.",
  "rejectionReason": "The mobile responsiveness needs improvement.",
  "submittedAt": "2026-01-25T10:00:00Z",
  "requirementTitle": "Build E-commerce Website",
  "clientId": 2,
  "clientName": "Jane Smith"
}
```

---

## Gigs Endpoints

### 1. Create Gig

**POST** `/api/v1/gigs`

Creates a new service gig (FREELANCER only).

**Authorization:** Required (FREELANCER role)

**Request Body:**

```json
{
  "title": "I will develop a React web application",
  "description": "Professional React development service with modern UI/UX design",
  "fixedPrice": 1500.0,
  "skills": "[\"React\", \"JavaScript\", \"CSS\", \"HTML\"]",
  "status": "ACTIVE"
}
```

**Fields:**

- `title` (required): Gig title
- `description` (optional): Detailed service description
- `fixedPrice` (required): Fixed price for the service
- `skills` (optional): JSON string array of skills
- `status` (optional): "ACTIVE" or "INACTIVE"

**Response:**

```json
{
  "id": 1,
  "freelancerId": 3,
  "title": "I will develop a React web application",
  "description": "Professional React development service with modern UI/UX design",
  "fixedPrice": 1500.0,
  "skills": "[\"React\", \"JavaScript\", \"CSS\", \"HTML\"]",
  "status": "ACTIVE",
  "createdAt": "2026-01-24T04:00:00Z",
  "updatedAt": "2026-01-24T04:00:00Z"
}
```

---

### 2. List All Gigs

**GET** `/api/v1/gigs`

Lists all active gigs with optional filtering.

**Authorization:** None required

**Query Parameters:**

- `skill` (optional): Filter by skill name
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional): Page number (0-based, default: 0)
- `size` (optional): Page size (default: 10)

**Response:**

```json
{
  "content": [
    {
      "id": 1,
      "freelancerId": 3,
      "title": "I will develop a React web application",
      "description": "Professional React development service with modern UI/UX design",
      "fixedPrice": 1500.0,
      "skills": "[\"React\", \"JavaScript\", \"CSS\", \"HTML\"]",
      "status": "ACTIVE",
      "createdAt": "2026-01-24T04:00:00Z",
      "updatedAt": "2026-01-24T04:00:00Z"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

---

### 3. Get Single Gig

**GET** `/api/v1/gigs/{id}`

Get detailed information about a specific gig.

**Authorization:** None required

**Path Parameters:**

- `id`: Gig ID

**Response:**

```json
{
  "id": 1,
  "freelancerId": 3,
  "title": "I will develop a React web application",
  "description": "Professional React development service with modern UI/UX design",
  "fixedPrice": 1500.0,
  "skills": "[\"React\", \"JavaScript\", \"CSS\", \"HTML\"]",
  "status": "ACTIVE",
  "createdAt": "2026-01-24T04:00:00Z",
  "updatedAt": "2026-01-24T04:00:00Z"
}
```

---

### 4. Update Gig

**PUT** `/api/v1/gigs/{id}`

Update an existing gig (FREELANCER only - own gigs).

**Authorization:** Required (FREELANCER role)

**Path Parameters:**

- `id`: Gig ID

**Request Body:**

```json
{
  "title": "I will develop a React web application with backend",
  "description": "Full-stack React and Node.js development service",
  "fixedPrice": 2000.0,
  "skills": "[\"React\", \"Node.js\", \"MongoDB\", \"Express\"]",
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "id": 1,
  "freelancerId": 3,
  "title": "I will develop a React web application with backend",
  "description": "Full-stack React and Node.js development service",
  "fixedPrice": 2000.0,
  "skills": "[\"React\", \"Node.js\", \"MongoDB\", \"Express\"]",
  "status": "ACTIVE",
  "createdAt": "2026-01-24T04:00:00Z",
  "updatedAt": "2026-01-25T10:00:00Z"
}
```

---

### 5. Delete Gig

**DELETE** `/api/v1/gigs/{id}`

Soft delete a gig (FREELANCER only - own gigs).

**Authorization:** Required (FREELANCER role)

**Path Parameters:**

- `id`: Gig ID

**Response:**

```
204 No Content
```

---

### 6. Get Gigs by Freelancer

**GET** `/api/v1/gigs/freelancer/{freelancerId}`

Lists all gigs created by a specific freelancer.

**Authorization:** None required

**Path Parameters:**

- `freelancerId`: Freelancer ID

**Query Parameters:**

- `page` (optional): Page number (0-based, default: 0)
- `size` (optional): Page size (default: 10)

**Response:**

```json
{
  "content": [
    {
      "id": 1,
      "freelancerId": 3,
      "title": "I will develop a React web application",
      "description": "Professional React development service with modern UI/UX design",
      "fixedPrice": 1500.0,
      "skills": "[\"React\", \"JavaScript\", \"CSS\", \"HTML\"]",
      "status": "ACTIVE",
      "createdAt": "2026-01-24T04:00:00Z",
      "updatedAt": "2026-01-24T04:00:00Z"
    },
    {
      "id": 2,
      "freelancerId": 3,
      "title": "I will create a mobile app",
      "description": "Flutter mobile app development",
      "fixedPrice": 2000.0,
      "skills": "[\"Flutter\", \"Dart\", \"Firebase\"]",
      "status": "ACTIVE",
      "createdAt": "2026-01-24T05:00:00Z",
      "updatedAt": "2026-01-24T05:00:00Z"
    }
  ],
  "totalElements": 2,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

---

## Freelancer Endpoints

### 1. List Freelancers

**GET** `/api/freelancers`

Lists all freelancer profiles.

**Authorization:** None required

**Response:**

```json
[
  {
    "freelancerId": 3,
    "userId": 3,
    "title": "Full Stack Developer",
    "description": "Experienced developer with 5+ years in web development",
    "user": {
      "userId": 3,
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "userType": "FREELANCER"
    }
  }
]
```

---

## Test Endpoints

### 1. Public Test Endpoint

**GET** `/api/v1/test/public`

Public endpoint for testing API connectivity.

**Authorization:** None required

**Response:**

```json
{
  "message": "This is a public endpoint",
  "timestamp": 1706140800000
}
```

---

### 2. List All Users (Development Only)

**GET** `/api/v1/test/users`

Lists all users in the database (for development/testing purposes).

**Authorization:** None required (Development only)

**Response:**

```json
{
  "message": "All users in database",
  "totalUsers": 3,
  "users": [
    {
      "userId": 1,
      "email": "client@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "userType": "CLIENT"
    },
    {
      "userId": 2,
      "email": "freelancer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "FREELANCER"
    }
  ]
}
```

---

## Status Codes

### Success Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully

### Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Data Types

### Requirement Status

- `OPEN`: Accepting proposals
- `CLOSED`: No longer accepting proposals

### Proposal Status

- `PENDING`: Waiting for client decision
- `ACCEPTED`: Proposal accepted by client, work can begin
- `REJECTED`: Proposal rejected by client
- `COMPLETION_REQUESTED`: Freelancer has submitted completed work
- `REVISION_REQUESTED`: Client has requested revisions
- `COMPLETED`: Project completed and approved by client

### User Roles

- `CLIENT`: Can create requirements and accept proposals
- `FREELANCER`: Can submit proposals and create gigs

### Gig Status

- `ACTIVE`: Gig is available
- `INACTIVE`: Gig is not available

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "timestamp": "2026-01-24T04:00:00Z"
}
```

---

## Notes for UI Development

1. **Authentication Flow:**
   - Use `/api/v1/auth/register` and `/api/v1/auth/login` for user authentication
   - JWT tokens are automatically set as HTTP-only cookies
   - Check authentication status with `/api/v1/auth/me`

2. **Role-based Features:**
   - Show different UI based on user role (CLIENT vs FREELANCER)
   - Clients can create requirements, view/accept proposals, and manage project completion
   - Freelancers can browse requirements, submit proposals, create gigs, and manage ongoing work

3. **Project Workflow:**
   - After proposal acceptance, use `/api/v1/proposals/me/ongoing` to track active projects
   - Freelancers use `/api/v1/proposals/{id}/request-completion` to submit completed work
   - Clients can approve or request revisions using completion endpoints
   - Track project status through proposal status field

4. **Pagination:**
   - Requirements and gigs listing support pagination with `page`, `size`, and `sort` parameters
   - Use standard Spring Boot Page response format

5. **Real-time Updates:**
   - Consider polling `/api/v1/requirements/{id}` for proposal count updates
   - Poll `/api/v1/proposals/me` for proposal status changes
   - Poll `/api/v1/proposals/me/ongoing` for project updates

6. **Data Formatting:**
   - All prices are in decimal format (e.g., `1500.00`)
   - Dates are in ISO 8601 format with timezone
   - Skills are JSON string arrays

7. **Business Rules:**
   - Only one proposal per freelancer per requirement
   - Accepting a proposal automatically closes the requirement
   - Rejected proposals cannot be reactivated
   - Completed projects require client approval
   - Revision requests return proposals to work-in-progress status

8. **Gig Management:**
   - Freelancers can create, update, and soft-delete their own gigs
   - Gigs support skill-based and price-based filtering
   - Gig status controls visibility (ACTIVE/INACTIVE)
