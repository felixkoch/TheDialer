import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import 'typeface-roboto/index.css';
import CssBaseline from '@material-ui/core/CssBaseline';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import PhoneIcon from '@material-ui/icons/Phone';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { withStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';

import callSnom from '../callSnom';
import Store from '../Store';


const styles = theme => ({
  error: {
    backgroundColor: theme.palette.error.dark,
  }});


class App extends Component {
  constructor(props) {
    super(props);

    this.store = new Store();

    this.state = {
      ip: this.store.get('ip'),
      user: this.store.get('user'),
      password: this.store.get('password'),
      testnumber: this.store.get('testnumber'),
      error: this.store.get('error'),
      loading: this.store.get('loading')
    };
  }

  handleChange = e => {
    console.log('handleChange');
    this.setState({ error: '' });
    this.store.set('error', '');

    this.setState({ [e.target.name]: e.target.value });
    this.store.set(e.target.name, e.target.value);
    console.log(this.store.get(e.target.name));
  };

  testCall = () => {
    this.setState({ loading: true });
    this.store.set('loading', true);

    this.setState({ error: '' });
    this.store.set('error', '');

    callSnom(
      {
        ip: this.store.get('ip'),
        user: this.store.get('user'),
        password: this.store.get('password'),
        number: this.store.get('testnumber')
      },
      response => {
        this.setState({ error: response.error });
        this.store.set('error', response.error);
        this.setState({ loading: false });
        this.store.set('loading', false);

      }
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
          open={this.state.error != ''}
          autoHideDuration={6}
        >
          <SnackbarContent
            className={classes.error}
            message={<span>{this.state.error}</span>}
          />
        </Snackbar>
        <Paper style={{ padding: 24 }}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Typography variant="h4" align="center">
                click2snom
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="IP / Host *"
                fullWidth
                value={this.state.ip}
                name="ip"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Benutzer"
                fullWidth
                value={this.state.user}
                name="user"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Passwort"
                fullWidth
                type="password"
                value={this.state.password}
                name="password"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Test Rufnummer"
                fullWidth
                value={this.state.testnumber}
                name="testnumber"
                onChange={this.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={this.testCall}
                disabled={this.state.loading}
              >
                <PhoneIcon style={{ mariginRight: 24 }} />
                {this.state.loading ? "Bitte warten": "Test Rufnummer wählen"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App)
