import { describe, it, expect } from 'vitest';
import {
  APP_NAV_ROUTES,
  findDirectRouteMatch,
  findCommandNavigationIntent,
  isExplicitQuestion,
  answerQueryWithKnowledgeBase,
} from '../chatbotData';

describe('AIChatbot Navigation & Command Parser', () => {
  it('contains all essential FlowShield routes in registry', () => {
    const paths = APP_NAV_ROUTES.map((r) => r.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/stations');
    expect(paths).toContain('/basins');
    expect(paths).toContain('/bulletins');
    expect(paths).toContain('/disasters');
    expect(paths).toContain('/watchlist');
    expect(paths).toContain('/report-incident');
    expect(paths).toContain('/contact');
    expect(paths).toContain('/help');
    expect(paths).toContain('globe');
  });

  it('resolves direct slash commands accurately', () => {
    expect(findDirectRouteMatch('/stations')?.path).toBe('/stations');
    expect(findDirectRouteMatch('/basins')?.path).toBe('/basins');
    expect(findDirectRouteMatch('/bulletins')?.path).toBe('/bulletins');
    expect(findDirectRouteMatch('/disasters')?.path).toBe('/disasters');
    expect(findDirectRouteMatch('/contact')?.path).toBe('/contact');
    expect(findDirectRouteMatch('/help')?.path).toBe('/help');
    expect(findDirectRouteMatch('/globe')?.path).toBe('globe');
    expect(findDirectRouteMatch('/')?.path).toBe('/');
  });

  it('resolves single-word natural aliases', () => {
    expect(findDirectRouteMatch('stations')?.path).toBe('/stations');
    expect(findDirectRouteMatch('basins')?.path).toBe('/basins');
    expect(findDirectRouteMatch('bulletin')?.path).toBe('/bulletins');
    expect(findDirectRouteMatch('disasters')?.path).toBe('/disasters');
    expect(findDirectRouteMatch('watchlist')?.path).toBe('/watchlist');
    expect(findDirectRouteMatch('sos')?.path).toBe('/contact');
    expect(findDirectRouteMatch('helpline')?.path).toBe('/contact');
    expect(findDirectRouteMatch('globe')?.path).toBe('globe');
  });

  it('distinguishes explicit questions from navigation commands', () => {
    // These are questions - should NOT be treated as direct navigation commands
    expect(isExplicitQuestion('What is the danger level in stations?')).toBe(true);
    expect(findCommandNavigationIntent('What is the danger level in stations?')).toBeNull();

    expect(isExplicitQuestion('How many stations are monitored?')).toBe(true);
    expect(findCommandNavigationIntent('How many stations are monitored?')).toBeNull();

    expect(isExplicitQuestion('Tell me about Kedarnath flood')).toBe(true);
    expect(findCommandNavigationIntent('Tell me about Kedarnath flood')).toBeNull();

    expect(isExplicitQuestion('What are the helpline numbers?')).toBe(true);
    expect(findCommandNavigationIntent('What are the helpline numbers?')).toBeNull();

    // These are explicit navigation commands
    expect(isExplicitQuestion('stations')).toBe(false);
    expect(findCommandNavigationIntent('stations')?.path).toBe('/stations');

    expect(isExplicitQuestion('go to river basins')).toBe(false);
    expect(findCommandNavigationIntent('go to river basins')?.path).toBe('/basins');

    expect(isExplicitQuestion('open daily flood bulletins')).toBe(false);
    expect(findCommandNavigationIntent('open daily flood bulletins')?.path).toBe('/bulletins');

    expect(isExplicitQuestion('launch 3d globe')).toBe(false);
    expect(findCommandNavigationIntent('launch 3d globe')?.path).toBe('globe');
  });
});

describe('AIChatbot Local Knowledge Base', () => {
  it('answers water level and stage threshold queries', () => {
    const res = answerQueryWithKnowledgeBase('What is Warning Level vs Danger Level vs HFL?');
    expect(res.text).toContain('Warning Level (WL)');
    expect(res.text).toContain('Danger Level (DL)');
    expect(res.text).toContain('Highest Flood Level');
    expect(res.route?.path).toBe('/stations');
  });

  it('answers emergency helpline and SOS queries', () => {
    const res = answerQueryWithKnowledgeBase('What is the emergency helpline for flood rescue?');
    expect(res.text).toContain('112');
    expect(res.text).toContain('1070');
    expect(res.text).toContain('1077');
    expect(res.text).toContain('011-24363260');
    expect(res.route?.path).toBe('/contact');
  });

  it('answers NDMA safety and go-bag protocol questions', () => {
    const res = answerQueryWithKnowledgeBase('What should I do during a flood? NDMA safety guidelines');
    expect(res.text).toContain('Move to Higher Ground');
    expect(res.text).toContain('15 cm (6 inches)');
    expect(res.text).toContain('Emergency Go-Bag');
  });

  it('answers historical disaster queries with verified facts', () => {
    const res = answerQueryWithKnowledgeBase('Tell me about Wayanad landslide and Kedarnath disaster');
    expect(res.text).toContain('Wayanad Landslides');
    expect(res.text).toContain('Kedarnath Himalayan Deluge');
    expect(res.route?.path).toBe('/disasters');
  });

  it('answers river basin hydrological queries', () => {
    const res = answerQueryWithKnowledgeBase('Tell me about the Ganga and Yamuna river basin');
    expect(res.text).toContain('Ganga-Yamuna Basin');
    expect(res.route?.path).toBe('/basins');
  });

  it('answers city-specific flood scenario queries (e.g. Patna, Delhi, National)', () => {
    // The exact user query
    const patnaRes = answerQueryWithKnowledgeBase('whats the current scenario of flood in patna');
    expect(patnaRes.text).toContain('Current Flood Scenario — Patna (Bihar)');
    expect(patnaRes.text).toContain('Patna (Digha Ghat)');
    expect(patnaRes.text).toContain('50.82 m');
    expect(patnaRes.text).toContain('Danger Level');
    expect(patnaRes.text).toContain('Severe Flood Situation');
    expect(patnaRes.text).toContain('1077');
    expect(patnaRes.route?.path).toBe('/stations');

    // Delhi query
    const delhiRes = answerQueryWithKnowledgeBase('whats the current scenario of flood in delhi');
    expect(delhiRes.text).toContain('Delhi NCR (River Yamuna)');
    expect(delhiRes.text).toContain('Delhi (Old Railway Bridge)');
    expect(delhiRes.text).toContain('206.15 m');
    expect(delhiRes.route?.path).toBe('/stations');

    // National query
    const nationalRes = answerQueryWithKnowledgeBase('whats the national flood scenario in india');
    expect(nationalRes.text).toContain('National Flood Scenario — India');
    expect(nationalRes.text).toContain('1,500 Telemetry Stations');
  });

  it('answers greetings with warm welcoming persona instead of generic fallback', () => {
    const helloRes = answerQueryWithKnowledgeBase('hello');
    expect(helloRes.text).toContain('Namaste! Hello!');
    expect(helloRes.text).toContain('FlowShield AI');

    const hiRes = answerQueryWithKnowledgeBase('hi');
    expect(hiRes.text).toContain('Namaste! Hello!');
  });
});
