import { createSovereigntyApp } from './server';
const port = Number(process.env.PORT ?? 8787); createSovereigntyApp().listen(port, () => console.log(JSON.stringify({ service: 'sovereignty-control-plane', port })));
