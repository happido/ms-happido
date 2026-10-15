import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MarketingTab from './MarketingTab';

describe('MarketingTab DOM Verification', () => {
  it('renders correctly and has DOM elements', () => {
    const { getByText, getByPlaceholderText } = render(<MarketingTab />);
    
    // Check if Create Campaign button exists
    const createBtn = getByText('+ New Offer');
    expect(createBtn).toBeTruthy();

    // Click it
    fireEvent.press(createBtn);

    // Now check if inputs appear
    const promoInput = getByPlaceholderText('e.g. DIWALI50');
    expect(promoInput).toBeTruthy();
    
    // Type in it
    fireEvent.changeText(promoInput, 'TESTPROMO');
    expect(promoInput.props.value).toBe('TESTPROMO');

    // Check tags
    const trendingTag = getByText('Trending');
    expect(trendingTag).toBeTruthy();
    
    // Click a tag
    fireEvent.press(trendingTag);

    // Look for Launch button
    const launchBtn = getByText('Launch Campaign');
    expect(launchBtn).toBeTruthy();
    
    console.log('✅ DOM Test Passed: All interactions succeeded virtually.');
  });
});
