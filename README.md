# SQL Query Editor / sqlSync

A web-based application that allows users to run SQL queries and view results instantly. This application provides a clean, intuitive interface for writing queries, viewing results, and filtering data.

![image](https://github.com/user-attachments/assets/ed9dbd27-3302-4d55-af29-357ed8f08bee)

## Project Walkthrough :
https://drive.google.com/file/d/1JItBNgbRPbIBiGM0ES8LWvwmhjrcpETn/view?usp=sharing

## 🚀 Features

- **Query Input:** Clean, syntax-highlighted editor for SQL queries
- **Predefined Queries:** Several sample queries available via dropdown
- **Data Visualization:** Display query results in a well-formatted table
- **Filtering:** Filter table data by any column in real-time
- **Dark/Light Mode:** Toggle between themes with persistent preference
- **Query History:** Track and revisit previously executed queries
- **Infinite Scrolling:** Handle large datasets efficiently without browser crashes
- **Responsive Design:** Works on desktop and mobile devices
- **Warning Notifications:** Toast messages for validation issues

## Technologies Used

- **Framework:** React with TypeScript
- **State Management:** React Hooks and Context API
- **UI Components:** Custom components with Lucide React for icons
- **Styling:** Custom CSS with CSS variables for theming
- **Build Tool:** Vite for fast development and optimized production builds

## Installation

1. Clone the repository
   ``` git clone https://github.com/yourusername/sqlSync.git ```
   ``` cd sql-query-editor ```
   
3. Install dependencies
   ``` npm install ```
5. Start the development server
   ``` npm run dev ```
7. Build for production
   ``` npm run build ```

## Performance Optimizations

The application implements several performance optimizations:

- **Virtualized Rendering:** Only renders visible rows using infinite scrolling
- **Lazy Loading:** Loads data in chunks as the user scrolls
- **Debounced Filtering:** Updates filter results efficiently
- **Code Splitting:** Organized into separate components and hooks
- **Memoization:** Uses React's useCallback to optimize re-renders
- **Efficient DOM Updates:** Minimizes DOM operations for better performance

### Page Load Time

- **Initial load time:** ~180ms (measured using Chrome DevTools Performance panel)
- **Time to interactive:** ~350ms
- **First contentful paint:** ~220ms

*These times were measured on a standard desktop configuration (i5 processor, 16GB RAM).*

## Project Structure

```text
src/
├─ components/          # UI components
├─ ├─ common/             # Shared components (ThemeToggle, Toast, etc.)
├─ ├─ layout/             # Layout components (Header)
├─ ├─ query/              # Query-related components
├─ contexts/           # React Context providers
├─ data/               # Sample query data
├─ hooks/              # Custom React hooks
├─ types/              # TypeScript interfaces and types
└─ utils/              # Utility functions

```
## Implementation Details

### Query Execution

The application simulates query execution with predefined datasets. In a real-world scenario, this would connect to an actual database backend.

### Data Filtering

The filtering system works by:
- Taking filter input from the user for any column
- Applying case-insensitive filtering to the dataset
- Displaying filtered results while maintaining pagination
- Showing count of filtered vs. total rows

### Theme Management

The application uses a React Context to manage theme state:
- Theme preference is stored in localStorage
- CSS variables are used for consistent theming
- Transitions ensure smooth theme switching

### History Management

Query history is:
- Stored in localStorage
- Limited to 50 entries to prevent excessive storage use
- Displayed with timestamps and query previews
- Allows deletion of individual history items or all history
