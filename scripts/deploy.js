import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import YourComponent from './YourComponent';
import YourInlineEditComponent from './YourInlineEditComponent'; // Ensure this line correctly imports YourInlineEditComponent
import '@testing-lang/jest-dom/extend-expect';

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

    it('responds to user clicks in inline edit component', async () => {
        render(<YourInlineEditComponent />);
        const editButton = screen.getByRole('button', { name: /edit/i });
        
        userEvent.click(editButton);
        
        await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    });

    it('allows updating data through inline edit component', async () => {
        const initialValue = "Initial content";
        const updatedValue = "Updated content";

        render(<YourInlineEditComponent />);
        mock.onPost(process.env.REACT_APP_YOUR_API_URL).reply(config => {
            expect(JSON.parse(config.data)).toEqual({data: updatedValue});
            return [200, { data: updateded content }];
        });

        userEvent.type(screen.getByRole('textbox'), updatedName);
        userEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => expect(screen.getByText(updatedValue)).toBeInTheDocument());
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