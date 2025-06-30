import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/">Go to Home</Link>
    </div>
  );
};

export default PageNotFound;