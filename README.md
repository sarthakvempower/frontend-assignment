# Generic Table Component

A React + TypeScript implementation of a generic table component that supports searching, pagination, inline editing, row selection, and bulk deletion. The application fetches user data from the provided API and performs all operations in memory.

## Features

### Core Requirements Implemented

- Display user data in a tabular format with clearly distinguished column headers.
- Search functionality that filters users across all properties.
- Inline row editing.
- Inline row deletion.
- Pagination with:
  - 10 rows per page
  - First page button
  - Previous page button
  - Next page button
  - Last page button
  - Dynamic page count based on filtered results
- Individual row selection using checkboxes.
- Bulk deletion of selected rows.
- Select/Deselect All functionality for rows displayed on the current page only.

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Fetch API

## Project Structure

text src/ │ ├── components/ │   ├── Table/ │   ├── Pagination/ │   ├── SearchBar/ │ ├── services/ │   └── userService.ts │ ├── types/ │   └── user.types.ts │ ├── hooks/ │ ├── App.tsx └── main.tsx 

## Environment Variables

Create a .env file in the root directory:

env VITE_API_URL=YOUR_API_URL_HERE 

## Installation

Clone the repository:

bash git clone <repository-url> 

Navigate to the project:

bash cd project-name 

Install dependencies:

bash npm install 

Start the development server:

bash npm run dev 

Build for production:

bash npm run build 

<img width="954" height="735" alt="image" src="https://github.com/user-attachments/assets/54e77e9e-a511-442a-b0f4-658685b5d439" />
