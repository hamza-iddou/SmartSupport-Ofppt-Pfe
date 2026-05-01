# 📘 SmartSupport API Documentation

Base URL:
http://127.0.0.1:8000/api

---

# 🔐 Authentication

## Register
**POST** /register  
Create a new user.

Request:
{
  "name": "Hamza",
  "email": "hamza@mail.com",
  "password": "123456"
}

---

## Login
**POST** /login  
Returns JWT token.

Response:
{
  "token": "your_jwt_token"
}

---

## Logout
**POST** /logout  
Invalidate current token.

---

## Refresh Token
**POST** /refresh  
Get a new JWT token.

---

# 🏢 Workspaces

## Get Workspaces
**GET** /workspaces  
Get all workspaces the user belongs to.

---

## Create Workspace
**POST** /workspaces  

Request:
{
  "name": "My Company"
}

---

## Get Workspace Details
**GET** /workspaces/{id}  
Get workspace info + members.

---

## Update Workspace
**PUT** /workspaces/{id}  
(Admin only)

Request:
{
  "name": "New Name",
  "image": "image_url"
}

---

## Delete Workspace
**DELETE** /workspaces/{id}  
(Admin only)

---

# 👥 Members

## Get Members
**GET** /workspaces/{id}/members  

---

## Invite Member
**POST** /workspaces/{id}/members  

Request:
{
  "email": "user@mail.com"
}

---

## Update Member Role
**PUT** /workspaces/{id}/members/{user_id}  

Request:
{
  "role": "admin"
}

---

## Remove Member
**DELETE** /workspaces/{id}/members/{user_id}  

---

## Leave Workspace
**POST** /workspaces/{id}/leave  

---

# 🎫 Tickets

## Get Tickets
**GET** /workspaces/{id}/tickets  

Supports filters:
- ?status=pending
- ?status=in_progress
- ?status=resolved
- ?assigned_to=USER_ID
- ?category=network

---

## Create Ticket
**POST** /workspaces/{id}/tickets  

Request:
{
  "title": "Cannot connect to WiFi",
  "description": "My laptop cannot connect since yesterday"
}

Automatically includes:
- AI summary
- AI suggestion
- AI category

---

## Get Ticket Details
**GET** /workspaces/{id}/tickets/{ticket_id}  

Returns:
- title
- description
- status
- assigned user
- AI summary
- AI suggestion
- AI category

---

## Update Ticket Status
**PUT** /workspaces/{id}/tickets/{ticket_id}/status  

(Admin or assigned user)

Request:
{
  "status": "resolved"
}

---

## Assign Ticket
**PUT** /workspaces/{id}/tickets/{ticket_id}/assign  

(Admin only)

Request:
{
  "assigned_to": 5
}

---

## Delete Ticket
**DELETE** /workspaces/{id}/tickets/{ticket_id}  

(Admin only)

---

# 📜 Ticket Logs

## Get Ticket Logs
**GET** /workspaces/{id}/tickets/{ticket_id}/logs  

Returns history:
- Ticket created
- Assigned to user
- Status changes
- Updates

---

# 📊 Dashboard

## Get Workspace Statistics
**GET** /workspaces/{id}/stats  

Response:
{
  "total_tickets": 50,
  "pending_tickets": 10,
  "in_progress_tickets": 15,
  "resolved_tickets": 25,
  "average_resolution_time": "3.2 hours"
}

---

# 🔐 Authentication Header

All protected routes require:

Authorization: Bearer YOUR_TOKEN

---

# 🧠 Notes

- All endpoints require JWT except login/register
- Multi-tenant system: users only access their workspaces
- Admin has full control over workspace and tickets
- AI assists with:
  - categorization
  - summarization
  - solution suggestions

---

# 🚀 Status

Backend is ready for frontend integration.