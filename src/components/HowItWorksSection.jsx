import React from 'react';

const HowItWorksSection = () => {
    const howItWorksSteps = [
        { step: 1, icon: '✓', title: 'Register & Verify', desc: 'Secure your account using console-based OTP authentication (US-1).' },
        { step: 2, icon: '👥', title: 'Join or Create Circles', desc: 'Discover relevant communities or start your own niche group (US-3).' },
        { step: 3, icon: '💬', title: 'Engage in Structured Chat', desc: 'Dive into threaded discussions for focused, organized conversations (US-4).' },
        { step: 4, icon: '📤', title: 'Contribute Knowledge', desc: 'Share valuable resources and expertise with a curated audience (US-5).' }
    ];

    const StepCard = ({ item }) => (
        <div 
            style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #e0e0e0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out',
                textAlign: 'center',
                width: '40vw',
                height: '25vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#1976D2';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e0e0e0';
            }}
        >
            {/* Step Number Circle */}
            <div 
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#1976D2',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '16px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                }}
            >
                {item.step}
            </div>

            <div 
                style={{ 
                    color: '#1976D2', 
                    marginBottom: '12px', 
                    fontSize: '40px',
                    flexShrink: 0
                }}
            >
                {item.icon}
            </div>
            
            <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#212121',
                margin: '0 0 8px 0',
                fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
                flexShrink: 0
            }}>
                {item.title}
            </h3>
            <p style={{ 
                fontSize: '0.875rem',
                color: '#757575',
                margin: 0,
                lineHeight: 1.5,
                padding: '0 10px',
                marginBottom: '4px',
                fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
            }}>
                {item.desc}
            </p>
        </div>
    );

    return (
        <div style={{ 
            padding: '64px 20px',
            minHeight: '100vh'
        }}>
            <div style={{ 
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <h2 style={{ 
                    fontSize: '2.5rem',
                    textAlign: 'center',
                    marginBottom: '64px',
                    fontWeight: 600,
                    color: '#212121',
                    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif'
                }}>
                    The Discussify Journey
                </h2>

                {/* Vertical flow with down arrows */}
                <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0'
                }}>
                    {howItWorksSteps.map((item, index) => (
                        <React.Fragment key={index}>
                            <StepCard item={item} />
                            
                            {/* Down arrow between cards */}
                            {index < howItWorksSteps.length - 1 && (
                                <div style={{
                                    fontSize: '3rem',
                                    color: '#1976D2',
                                    margin: '16px 0',
                                    fontWeight: 'bold'
                                }}>
                                    ↓
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HowItWorksSection;