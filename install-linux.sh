#!/bin/sh

if [ "$(id -u)" != "0" ]; then
    echo "You don't have root permissions"
    exit 1
fi

install_generic() {
    # install dependencies
    curl -sS https://webi.sh/watchexec | sh
}

wkhtmltopdf_ubuntu() {
    echo "Uninstalling previous wkhtmltopdf"
    apt remove wkhtmltopdf -y
    echo "Installing wkhtmltopdf"
    url="https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.focal_amd64.deb"
    curl -LJO ${url} -o wkhtmltox_0.12.6-1.focal_amd64.deb
    apt install ./wkhtmltox_0.12.6-1.focal_amd64.deb -y
    rm ./wkhtmltox_0.12.6-1.focal_amd64.deb
}

just_ubuntu() {
    apt install just -y
}
# function to install app
install_os() {
    # ubuntu
    if [ "$(lsb_release -is)" = "Ubuntu" ]; then
        wkhtmltopdf_ubuntu
        just_ubuntu
    fi
}

install_generic
install_os

# check if this is ubuntu

# check user has root permissions
