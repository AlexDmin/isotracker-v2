import './App.css';
import IsoCtrl from './pages/isoCtrl/isoCtrl';
import Welcome from './pages/welcome/welcome';
import { Switch, Route} from 'react-router-dom';
import { BrowserRouter as Router} from 'react-router-dom';
import Register from './pages/register/register';
import LoginPage from './pages/loginPage/loginPage';
require('dotenv').config();



function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/"} component={Welcome}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/isotracker"} component={IsoCtrl}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/register"} component={Register}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/login"} component={LoginPage}></Route>
        </Switch>
      </Router>
  
    </div>
  );
}

export default App;
