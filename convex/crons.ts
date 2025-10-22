import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval('get crypto prices', { minutes: 5 }, internal.prices.refreshBtc);

export default crons;
