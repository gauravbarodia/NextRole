NextRole: Job Application Tracking Dashboard 🚀
NextRole is a responsive, React-based dashboard designed to provide job seekers with a centralized platform to track applications, monitor interview progress, and organize job offers.

✨ Features
Secure Authentication: Seamless user login powered by Firebase Authentication using the Google Auth Provider.

Real-Time Data Persistence: Utilizes Cloud Firestore for isolated, user-specific data retrieval and full CRUD operations (Create, Read, Update, Delete).

Dynamic Dashboard Analytics: Instantly calculates and displays your application metrics (Total, Interviews, Offers, Rejections) based on the current job list without redundant database queries.

Advanced Search & Filtering: Client-side data processing allows users to dynamically search applications by company or role and filter the view by specific application statuses.

Batch Operations: Features a "Clear All" function that utilizes Promise.all concurrency to efficiently execute multi-document database deletions.

Custom UI/UX: Built with a custom CSS variables framework featuring conditional status styling (e.g., green for offers, red for rejections) and interactive modals for data entry and deletion confirmation.

🛠️ Tech Stack
Frontend: React, Custom CSS

Icons: Lucide React

Backend/Database: Firebase Authentication, Cloud Firestore
LIVE LINK-https://nextrole-249a9.web.app/
