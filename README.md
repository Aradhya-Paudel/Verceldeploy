# Bachaoo - Emergency Response Optimization Platform

**Developed at Hackathon Nova 2026**  
CAPEC × ITEC-PEC | Pokhara Engineering College

GitHub: https://github.com/Aradhya-Paudel/CodeNotFound

---

## What We Built

Bachaoo is an emergency response platform that connects ambulances with the right hospitals in real-time. When someone needs emergency care, our system makes sure they get to a hospital that actually has what they need - the right blood type, the right specialists, and available beds - all on the first try.

---

## The Problem We're Solving

Right now, ambulances often take patients to hospitals that can't actually help them. Maybe the hospital doesn't have the right blood type in stock, or the specialist they need isn't on duty, or there are no beds available. Every time this happens, precious minutes are wasted transferring the patient somewhere else. In emergencies, those minutes can mean the difference between life and death.

We wanted to fix that.

---

## Our Solution

Bachaoo creates a direct connection between ambulances and hospitals. Hospitals keep their resources updated in real-time - blood inventory, which specialists are available, how many beds they have. When an ambulance crew assesses a patient, they enter what's needed into our system. Our algorithm instantly finds the nearest hospital that has everything required and guides them there.

No more guessing. No more wasted trips. Just the right hospital, the first time.

---

## How It Works

**Getting Help**

When an emergency happens, people can call 102, contact an ambulance directly through our website, or even use our guest login feature. If you're a bystander, you can upload photos of the accident and your GPS location automatically gets sent to the nearest ambulance.

**On the Way**

The ambulance crew picks up the patient and starts basic assessment during the ride. They log into our platform with their ambulance ID and record what they find - the patient's blood type if they need a transfusion, what kind of specialist is needed based on the injuries, how urgent the situation is.

**Finding the Right Hospital**

This is where our system really shines. It looks at every hospital in the network and checks:
- Do they have the required blood type in stock?
- Is the right specialist available right now?
- Do they have beds available?
- How far away are they from the ambulance's current location?

Within seconds, it finds the best match and gives the ambulance crew turn-by-turn directions, estimated arrival time, and all the hospital's contact information.

**Ready and Waiting**

The hospital gets notified that the ambulance is coming and what they'll need to prepare. Everyone's ready when the patient arrives.

---

## Key Features

**Multiple Ways to Call for Help**
- Emergency hotline (102)
- Website contact form
- Guest upload for bystanders with automatic GPS tracking

**Hospital Dashboard**
- Real-time blood inventory management
- Specialist availability tracking
- Bed and ICU capacity updates
- Emergency coordination tools
- Resource sharing between hospitals when needed

**Ambulance Interface**
- Quick login with Ambulance ID
- Simple patient data entry during transport
- Automatic GPS tracking
- Instant hospital recommendations with navigation

**Smart Matching**
- Checks blood availability across all hospitals
- Verifies specialist availability in real-time
- Considers bed capacity
- Calculates distances from current location
- Recommends the optimal hospital instantly

---

## What We Used

**Frontend:** React.js with JavaScript, HTML5, and CSS3  
**Backend:** Node.js with Express.js and RESTful APIs  
**Data Storage:** JSON files for lightweight, fast access  
**Special Features:** Multi-tier authentication, real-time data updates, geospatial distance calculations

---

## System Flow

```
Emergency Call/request → Ambulance Dispatch → Patient Assessment → System Input
                                                                  ↓
                                                    Matching Algorithm
                                                    (checks blood, specialists, beds, distance)
                                                                  ↓
                                            Hospital Recommendation + Navigation
                                                                  ↓
                                                    Patient Delivered to Right Hospital
```

---

## Getting Started

You'll need Node.js (version 16 or higher), npm or yarn, and Git installed on your computer.

**Setting Up the Code**

First, grab the code from our repository and navigate into the project folder. Then install the dependencies for both the frontend and backend parts of the application.

**Configuration**

You'll need to set up environment variables for both the frontend and backend. For the backend, create a file that includes your port number, JWT secret for authentication, and your Maps API key. For the frontend, add your API URL and Maps API key.

**Getting the Data Ready**

Initialize the data files that store hospital information, ambulance data, and user authentication. These JSON files will live in the backend data folder.

**Running the Application**

Start the backend server first - it'll run on port 5000. Then start the frontend, which will run on port 3000. Open your browser and you're ready to go!

---

## How to Use It

**If You Run a Hospital:**

Register your hospital through our portal with your facility details. Once you're verified, you can start updating your resources. Keep your blood inventory current, maintain your specialist schedule, and update bed availability in real-time. When ambulances are heading your way, you'll get notifications so you can prepare everything they need.

**If You're an Ambulance Crew:**

Log in with your unique Ambulance ID. During transport, assess your patient and document their vitals and injuries. If they need blood, do a quick blood type test. Then enter everything into the system - blood type, what specialists they need, how urgent it is. The system will show you which hospital to go to and how to get there.

**If You're Calling for Help:**

Call 102 or use our website. If you're at the scene but not the patient, use our guest login to upload photos. Your GPS location sends automatically so help knows exactly where to go.

---

## What's Next

**Right Now (During the Hackathon):**

We're focused on perfecting our core matching algorithm, finishing the hospital and ambulance portals, debugging the backend, and getting everything deployed and tested.

**After the Hackathon:**

We want to build mobile apps for iOS and Android, integrate real-time traffic data for better routing, add SMS and WhatsApp notifications, connect with patient medical history systems, and support multiple languages.

**Long-term Vision:**

Imagine AI that predicts when hospitals will need certain resources, integration with the national health database, telemedicine consultations during transport, analytics dashboards that help improve the whole system, and special modes for handling disasters with multiple casualties. We could even expand to use machine learning for resource allocation, integrate with wearable devices for continuous vitals monitoring, and roll out to cities across the country.

---

## The Team

**Team CodeNotFound**

We're a group of students passionate about using technology to solve real problems. For this hackathon, we divided up the work - handling documentation , presentation and research, building the frontend, developing the backend, and designing the database and APIs.

Built with determination (and probably too much coffee) at Hackathon Nova 2026.

---

## Get in Touch

Find our code and report any issues on GitHub: https://github.com/Aradhya-Paudel/CodeNotFound

---

*Built at Hackathon Nova 2026 | CAPEC × ITEC-PEC | Pokhara Engineering College*
