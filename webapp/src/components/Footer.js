import { Link } from "react-router-dom";

export default function Footer({ routeTo, routeName }) {
  return (
    <div className="footer navbar-dark bg-primary">
      <Link className="link" to={routeTo}>
        {routeName}
      </Link>
    </div>
  );
}

//HandleOnLinkClick can take the props.currentPath as argument
//Make the App.js component take history import and then
//initialise the history instance and use it to push pages to it
//then pass this object to the FAQ page to use it to know what the
//previous page is by invoking history.goBack...same way to do forwards upon 'Push'
