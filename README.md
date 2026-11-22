# Courier Management System

A simple web app to book couriers, update delivery status and track parcels. Built with plain HTML, CSS and JavaScript. No installation or backend needed.

## Features
- Book a courier with sender, receiver, route, weight and service type
- Auto-generated tracking ID and automatic cost calculation
- Dashboard with total, in-progress, delivered counts and revenue
- Search couriers by ID, name or city
- Update status: Booked → Picked Up → In Transit → Out for Delivery → Delivered
- Track a parcel by ID with a status timeline
- Delete couriers
- Data saved in the browser (localStorage)

## Tech Stack
HTML5, CSS3, JavaScript (ES6)

## How to Run
1. Download or clone this repository
2. Open `index.html` in any browser

## Project Structure
```
courier-management/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Pricing Logic
| Service   | Base | Per kg |
|-----------|------|--------|
| Standard  | ₹40  | ₹20    |
| Express   | ₹80  | ₹30    |
| Overnight | ₹150 | ₹40    |

## Future Improvements
- Backend with Node.js / Python and a database (MySQL or MongoDB)
- Admin login and delivery agent module
- SMS / email notifications

## Author
Your Name
