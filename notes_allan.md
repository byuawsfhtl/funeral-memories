# Alan's Notes

final notes



1. What is the default port for HTTP/HTTPS/SSH? 
	- 443
	
1. What does an HTTP status code in the range of 300/400/500 indicate?
	- 300: redirection
	- 400: client error
	- 500: server error
	
1. What does the HTTP header content-type allow you to do?
	- The format of the content being sent. These are described using standard [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) types.
	- audio/aac
	- application/vnd.amazon.ebook [kindle]
	- image/bmp [bitmap graphics]
	- text/css [CSS]
	- text/csv [CSV file]
	- image/gif [GIF]
	- video/mp4 [MP4 video]
	- image/png [PNG image]
	- application/pdf [Adobe PDF]
	- text/plain [generally ASCII]
	
1. What does a “Secure cookie”/”Http-only cookie”/”Same-site cookie” do? https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
	- HttpOnly: can't be accessed by JavaScript, only accessed when it reaches the server
	- cookies that persist user sessions should have this attribute set for security
	- Secure: attribute only sent to the server with an encrypted request over HTTPS protocol (helps avoid man in the middle attacks)
	- SameSite: lets servers specify whether cookies are sent with cross-site requests (3rd party cookies)
	- Strict - causes the browser to only send the cookie in response to requests originating from the cookie's origin site, Lax - the browser also sends the cookie when the user _navigates_ to the cookie's origin site (even if the user is coming from a different site). This is useful for cookies affecting the display of a site, None- specifies that cookies are sent on both originating and cross-site requests
	
5. Assuming the following Express middleware, what would be the console.log output for an HTTP GET request with a URL path of /api/document?
	- function middlewareName(req, res, next)

6. Given the following Express service code: What does the following front end JavaScript that performs a fetch return?
	-  fetch...

7. Given the following MongoDB query, select all of the matching documents {name:Mark}


8. How should user passwords be stored?
	- encrypted
	
1. Assuming the following node.js websocket code in the back end, and the following front end websocket code, what will the front end log to the console?


2. What is the websocket protocol intended to provide?
	- client server architecture

3. What do the following acronyms stand for? JSX, JS, AWS, NPM, NVM
	- javascript xml
	- javascript
	- amazon web services
	- node package manager
	- node version manager

5. Assuming an HTML document with a body element. What text content will the following React component generate?  The react component will use parameters.


6. Given a set of React components that include each other, what will be generated


7. What does a React component with React.useState do?
	- add a state variable to your component

8. What are React Hooks used for?
	- use different react features from your components (built in or build your own)
1. What does the State Hook/Context Hook/Ref Hook/Effect Hook/Performance Hook do? https://react.dev/reference/react/hooks
	- state hook: _State_ lets a component [“remember” information like user input.](https://react.dev/learn/state-a-components-memory) For example, a form component can use state to store the input value, while an image gallery component can use state to store the selected image index.
	- context hook: _Refs_ let a component [hold some information that isn’t used for rendering,](https://react.dev/learn/referencing-values-with-refs) like a DOM node or a timeout ID. Unlike with state, updating a ref does not re-render your component. Refs are an “escape hatch” from the React paradigm. They are useful when you need to work with non-React systems, such as the built-in browser APIs.
	- ref hook: _Refs_ let a component [hold some information that isn’t used for rendering,](https://react.dev/learn/referencing-values-with-refs) like a DOM node or a timeout ID. Unlike with state, updating a ref does not re-render your component. Refs are an “escape hatch” from the React paradigm. They are useful when you need to work with non-React systems, such as the built-in browser APIs.
	- effect hook: _Effects_ let a component [connect to and synchronize with external systems.](https://react.dev/learn/synchronizing-with-effects) This includes dealing with network, browser DOM, animations, widgets written using a different UI library, and other non-React code.
	- performance hook: A common way to optimize re-rendering performance is to skip unnecessary work. For example, you can tell React to reuse a cached calculation or to skip a re-render if the data has not changed since the previous render.


2. Given React Router code, select statements that are true.
		const root = ReactDOM.createRoot(document.getElementById('root'));
		root.render(
		  // BrowserRouter component that controls what is rendered
		  // NavLink component captures user navigation requests
		  // Routes component defines what component is routed to
		  <BrowserRouter>
		    <div className='app'>
		      <nav>
		        <NavLink to='/'>Home</Link>
		        <NavLink to='/about'>About</Link>
		        <NavLink to='/users'>Users</Link>
		      </nav>
		
		      <main>
		        <Routes>
		          <Route path='/' element={<Home />} exact />
		          <Route path='/about' element={<About />} />
		          <Route path='/users' element={<Users />} />
		          <Route path='*' element={<Navigate to='/' replace />} />
		        </Routes>
		      </main>
		    </div>
		  </BrowserRouter>
		);

3. What does the package.json file do?
	- lists the packages your project depends on
	- specifies versions of a package that your project can use
	- makes build reproducible, easier to share

4. What does the fetch function do?
	- js interface for making HTTP requests and processing the responses

5. What does node.js do?
	- open sourse server environment, allows you to run javascript on the server

6. What does pm2 do?
	- process manager for node.js apps (load balancer, logs facility, micro service management, etc)
	- daemon process manager

7. What does Vite do?
	- local development server, used for react project templates
	- out of the box support for common web patterns


