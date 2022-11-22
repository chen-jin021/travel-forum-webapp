const devEndpoint = 'http://localhost:5001/' // change this to 5000 if needed

// TODO [Deployment]: change this to your heroku app url
const prodEndpoint = 'https://SET_YOUR_HEROKU_URL_HERE.herokuapp.com/'

export const endpoint = process.env.NODE_ENV === 'production' ? prodEndpoint : devEndpoint
