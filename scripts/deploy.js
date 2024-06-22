import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import YourComponent from './YourComponent';
import '@testing-library/jest-dom/extend-expect';

process.env.REACT_APP_YOUR_API_URL = 'https://your-api.example.com';

describe('YourComponent', () => {
    let mock;
    beforeAll(() => {
        mock = new MockAdapter(axios);
    });
    
    it('loads and displays data fetched from an API', async () => {
        const testData = { data: 'Sample data from API' };
        
        mock.onGet(process.env.REACT_APP_YOUR_API_URL).reply(200, testData);
        
        render(<YourComponent />);
        
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => expect(screen.getByText(/Sample data from API/)).toBeInTheDocument());
    });
    
    it('responds to user clicks', async () => {
        // Assuming YourInlineEditComponent is defined and imported
        render(<YourInlineEditComponent />);
        // Corrected typo in button variable name below
        const editButton = screen.getByRole('button', { name: /edit/i });
        
        userEvent.click(editButton);
        
        await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    });
    
    it('displays an error message when the API call fails', async () => {
        mock.onGet(process.env.REACT_APP_YOUR_API_URL).networkError();
        
        render(<YourComponent />);
        
        await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    });

    afterAll(() => {
        mock.restore();
    });
});