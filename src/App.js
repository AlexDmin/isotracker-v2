import './App.css';
import IsoCtrl from './pages/isoCtrl/isoCtrl';
import Welcome from './pages/welcome/welcome';
import { Switch, Route} from 'react-router-dom';
import { BrowserRouter as Router} from 'react-router-dom';
import Register from './pages/register/register';
import LoginPage from './pages/loginPage/loginPage';
import ChangePasswordPage from './pages/changePassword/changePassword';
import Equipments from './pages/equipments/equipments';
import Instrumentation from './pages/instrumentation/instrumentation';
import Civil from './pages/civil/civil';
import Electrical from './pages/electrical/electrical';
import Home from './pages/home/home'
import Piping from './pages/piping/piping';
import ProgressCurve from './pages/progressCurve/progressCurve';
import Navis from './pages/navis/navis';
require('dotenv').config();



function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/"} component={Welcome}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/isotracker"} component={IsoCtrl}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/home"} component={Home}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/register"} component={Register}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/login"} component={LoginPage}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/changepassword"} component={ChangePasswordPage}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/equipments"} component={Equipments}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/instrumentation"} component={Instrumentation}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/civil"} component={Civil}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/electrical"} component={Electrical}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/piping"} component={Piping}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/3dprogress"} component={ProgressCurve}></Route>
            <Route exact path={"/"+process.env.REACT_APP_PROJECT+"/navis"} component={Navis}></Route>
        </Switch>
      </Router>
  
    </div>
  );
}

export default App;
