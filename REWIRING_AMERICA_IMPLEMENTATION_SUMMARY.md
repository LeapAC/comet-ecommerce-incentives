# Rewiring America Incentives Calculator Implementation Summary

## Project Overview
Integration of Rewiring America's embeddable Incentives Calculator into an e-commerce checkout flow for Comet EV Chargers, positioned strategically between shipping and payment sections to highlight potential savings.

## Implementation Timeline: Play-by-Play

### Phase 1: Research and Discovery
**Objective**: Understand the Rewiring America calculator implementation requirements

1. **Documentation Review**
   - Fetched and analyzed official documentation from https://docs.rewiringamerica.org/incentives/embed
   - Reviewed GitHub repository README for detailed implementation specifications
   - Identified two calculator types available: Incentives Calculator and Bill Impact Calculator

2. **Key Requirements Discovered**
   - Required scripts: Module JavaScript file and CSS for fonts
   - API key requirement from Rewiring America developer portal
   - Web component architecture using custom HTML elements
   - Event system for form submissions and resets

### Phase 2: Initial Component Creation
**Objective**: Create a React component wrapper for the web component

1. **Component Structure Setup**
   ```typescript
   // Created /components/incentives-calculator.tsx
   - TypeScript interfaces for props
   - Custom JSX element type definitions for the web component
   - React hooks for lifecycle management
   ```

2. **Environment Configuration**
   - Located API key in `.env` file
   - Initially hardcoded API key (mistake)
   - Corrected to use `NEXT_PUBLIC_` prefix for client-side access
   - Updated to use `process.env.NEXT_PUBLIC_REWIRING_AMERICA_API_KEY`

### Phase 3: Integration Challenges and Solutions

#### Challenge 1: Script Loading Strategy
**Initial Attempt**: Used Next.js `Script` component with `strategy="lazyOnload"`
- **Problem**: Calculator wasn't rendering despite Card container appearing
- **Root Cause**: Script needs `type="module"` attribute and must load before component renders

**Solution Evolution**:
1. First fix: Changed to `strategy="beforeInteractive"` and added `type="module"`
2. Final solution: Dynamic script injection directly into document head
   ```javascript
   const script = document.createElement("script")
   script.type = "module"
   script.src = "https://embed.rewiringamerica.org/state-calculator.js"
   document.head.appendChild(script)
   ```

#### Challenge 2: Invalid Project Type
**Error**: `Uncaught Error: Invalid project attribute: ev_charger`
- **Problem**: Used `projects="ev_charger"` based on assumption
- **Solution**: Referenced documentation to find correct value: `projects="ev"`
- **Valid options discovered**: `clothes_dryer`, `hvac`, `ev`, `solar`, `battery`, `water_heater`, `cooking`, `wiring`, `weatherization_and_efficiency`, `lawn_care`

### Phase 4: Checkout Page Integration
**Objective**: Seamlessly integrate calculator into existing checkout flow

1. **Placement Strategy**
   - Added between "Shipping Method" and "Payment Information" sections
   - Wrapped in matching Card component for visual consistency
   - Used CardTitle "Check for Incentives" with descriptive CardDescription

2. **Data Flow Implementation**
   - Passed user's ZIP code and state from shipping form to calculator
   - Pre-populated calculator with `owner-status="homeowner"`
   - Filtered for EV-related incentives with `projects="ev"`

### Phase 5: Advanced Feature Attempt - Incentive Amount Extraction
**Objective**: Extract calculated incentive amounts and display in order summary

1. **Initial Approach**
   - Added event listeners for `calculator-submitted` event
   - Attempted to parse incentive amounts from event data
   - Created callback prop `onIncentivesCalculated` to pass data to parent

2. **Implementation Details**
   ```javascript
   // Simple parsing strategy
   const dollarMatches = incentiveText.match(/\$([\d,]+)/g) || []
   dollarMatches.forEach(match => {
     const amount = parseInt(match.replace('$', '').replace(',', ''))
     totalIncentives += amount
   })
   ```

3. **Discovery of Limitation**
   - Event only contains form input data, not calculation results
   - Actual incentive information is rendered inside the component
   - No programmatic access to calculated incentive amounts

**Event Data Structure Received**:
```json
{
  "formData": {
    "zip": "30030",
    "ownerStatus": "homeowner",
    "householdIncome": "280000",
    "householdSize": "4",
    "taxFiling": "joint",
    "utility": "ga-georgia-power",
    "gasUtility": "no-gas"
  }
}
```

## Technical Architecture Analysis

### What Worked Well

1. **Quick Setup** (~30 minutes to basic implementation)
   - Clear documentation for basic embedding
   - Simple web component architecture
   - Minimal dependencies required

2. **Responsive Design**
   - Calculator automatically adapts to container width
   - Mobile-friendly out of the box
   - Professional UI that matches most design systems

3. **Data Pre-population**
   - Ability to pass ZIP code and state from existing form
   - Project filtering allows relevant incentive display
   - Owner status and other attributes can be preset

4. **Event System**
   - Clean event dispatch for form submission and reset
   - Allows for analytics tracking
   - Non-blocking integration pattern

### Challenges and Limitations

1. **Script Loading Complexity**
   - Module script type requirement not clearly documented
   - Next.js Script component compatibility issues
   - Required manual DOM script injection for reliability

2. **Limited Data Access**
   - No access to calculated incentive amounts programmatically
   - Event payload only includes input data, not results
   - Cannot integrate incentive amounts into checkout calculations

3. **Customization Constraints**
   - Limited CSS customization (only 3 color variables)
   - No control over internal layout or structure
   - Cannot modify or extend functionality

4. **API Key Management**
   - Requires public exposure of API key in client-side code
   - No server-side rendering option
   - Security implications for production use

## Feature Gap Analysis

### Current Rewiring America Implementation
- ✅ Visual display of incentives
- ✅ Form input handling
- ✅ Basic customization options
- ❌ Programmatic access to results
- ❌ Structured data output
- ❌ Server-side rendering support
- ❌ Advanced customization options

### Ideal Embedded Calculator Features
1. **Rich Event Data**
   ```javascript
   {
     formData: { /* inputs */ },
     results: {
       incentives: [
         { name, amount, type, description, requirements }
       ],
       totalSavings: 7550,
       eligibilityStatus: "eligible"
     }
   }
   ```

2. **JavaScript API**
   - `calculator.getIncentives()`
   - `calculator.setFormData()`
   - `calculator.reset()`

3. **Flexible Integration Options**
   - React/Vue/Angular components
   - Server-side API access
   - Headless mode for custom UI

## Recommendations for Building Similar Component

### If Building From Scratch

1. **Architecture Decisions**
   - Provide both web component and framework-specific packages
   - Emit detailed events with calculated results
   - Offer headless mode for custom UI implementations

2. **API Design**
   - Separate data fetching from UI rendering
   - Provide structured data outputs
   - Support server-side calculations

3. **Integration Features**
   - Comprehensive event system with input and output data
   - Programmatic API for all component functions
   - Extensive customization options

### For Current Implementation

1. **Workaround Options**
   - DOM scraping with MutationObserver (fragile)
   - Iframe with postMessage communication
   - Build custom UI using Rewiring America's API directly

2. **Production Considerations**
   - Monitor for component updates that might break integration
   - Implement error boundaries for component failures
   - Consider fallback UI if calculator fails to load

## Conclusion

The Rewiring America Incentives Calculator provides a **quick and visually polished solution** for displaying available incentives. The implementation was remarkably fast for basic functionality (~30 minutes), making it an excellent choice for MVPs or proof of concepts.

However, the **lack of programmatic access to calculated results** severely limits its usefulness in integrated e-commerce flows where incentive amounts need to affect pricing, checkout logic, or be stored in order data. This represents a significant feature gap for deep integrations.

### Key Takeaways

**Strengths**:
- Extremely quick to implement basic functionality
- Professional, tested UI with accessibility compliance
- Handles complex incentive logic without custom development
- Regular updates with latest incentive information

**Weaknesses**:
- No access to calculated data for integration
- Limited customization options
- Client-side only implementation
- Module loading complexities with modern frameworks

**Best Use Cases**:
- Informational displays where data extraction isn't needed
- Marketing pages to show potential savings
- Quick MVPs to test user interest
- Situations where visual display is sufficient

**Not Ideal For**:
- Deep e-commerce integrations
- Checkout flows requiring price adjustments
- Applications needing incentive data for business logic
- Highly customized user experiences

### Final Recommendation
For a production e-commerce integration requiring access to incentive amounts, consider building a custom solution using Rewiring America's API directly, which would provide full control over data flow and user experience while still leveraging their incentive database.