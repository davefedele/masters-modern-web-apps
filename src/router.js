import app from 'ampersand-app'
import React from 'react'
import Router from 'ampersand-router'
import qs from 'qs'
import xhr from 'xhr'

import Layout from './layout'
import Links from './components/nav-helper'
import PublicPage from './pages/public'
import ReposPage from './pages/repos'
import RepoDetail from './pages/repo-detail'

export default Router.extend({
  renderPage (page, opts = {layout: true}) {
    if (opts.layout) {
      page = (
        <Layout me={app.me}>
          {page}
        </Layout>
      )
    }

    React.render(page, document.body)
  },

  routes: {
    '': 'public',
    'repos': 'repos',
    'login': 'login',
    'repo/:owner/:name': 'repoDetail',
    'auth/callback?:query': 'authCallback',
    'logout': 'logout'
  },

  public () {
    this.renderPage(<PublicPage/>, {layout: false})
  },

  repos () {
    this.renderPage(<ReposPage repos={app.me.repos}/>)
  },

  repoDetail (owner, name) {
    const model = app.me.repos.getByFullName(owner + '/' + name)
    this.renderPage(<RepoDetail repo={model} labels={model.labels}/>)
  },

  login () {
    window.location = 'https://github.com/login/oauth/authorize?' + qs.stringify({
      client_id: '567338d67be7d8a760ad',
      redirect_uri: window.location.origin + '/auth/callback',
      scope: 'user, public_repo'
    })
  },

  authCallback (query) {
    query = qs.parse(query);
    console.log(query);

    xhr({
      url: 'https://labelr--gatekeeper.herokuapp.com/authenticate/' + query.code,
      json: true
    }, (err, req, body) => {
      console.log(body)
      app.me.token = body.token
      this.redirectTo('/repos')
    })
  },

  logout () {
    window.localStorage.clear()
    window.location = '/'
  }
})