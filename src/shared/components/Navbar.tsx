import { NavLink } from "react-router-dom";
import { NavbarRoleBasedLinks } from "../constants";
import type { UserRoleType } from "../types";


interface NavbarProps {
    role: UserRoleType;
    name: string | undefined;
}

const Navbar = ({ role, name }: NavbarProps) => {
    const links = NavbarRoleBasedLinks[role];

    return (
        <header>        
            <nav>  
                <div><NavLink to="/">MediBuddy</NavLink></div>          
                <ul>
                    {links.map(({to, label}) => (
                        <li key={to}>
                            <NavLink to={to}>{label}</NavLink>
                        </li>
                    ))}
                </ul>
                <div>
                    <span>
                        <img src="" alt='profile image'/>
                        <p>{name} dropdown</p>
                    </span>                
                </div>   
            </nav>
        </header>
    );
};

export default Navbar;
