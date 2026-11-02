import React from 'react'
import Header from "./header/index"
// import Footer from "./footer/index"


function Layout({ children }) {
    return (
        <div>
            <Header />
            {children}
            {/* <Footer /> */}

        </div>
    )
}

export default Layout