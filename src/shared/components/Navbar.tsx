import { NavLink } from "react-router-dom";
import { ROUTES } from "@/router/routes";
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
                            <NavLink
                                to={to}
                                end={role === "ADMIN" && to === ROUTES.admin.root}
                                className={role === "ADMIN" ? ({ isActive }) =>
                                    `rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400 ${isActive ? "font-semibold text-emerald-300 underline underline-offset-4" : ""}` : undefined}
                            >
                                {label}
                            </NavLink>
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
