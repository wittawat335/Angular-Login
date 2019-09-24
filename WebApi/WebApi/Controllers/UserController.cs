using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WebApi.Models;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private UserManager<ApplicationUser> _userManager;
        private SignInManager<ApplicationUser> _singInManager;
        private ApplicationSettings _appSetting;

        public UserController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IOptions<ApplicationSettings> appSetting)
        {
            _userManager = userManager;
            _singInManager = signInManager;
            _appSetting = appSetting.Value;
        }

        [HttpPost]
        [Route("Register")]
        //POST : /api/User/Register
        public async Task<Object> PostUser(ApplicationUserModel model)
        {
            //model.Role = "Customer";
            model.Role = "Admin";
            var user = new ApplicationUser();
            user.UserName = model.UserName;
            user.Email = model.Email;
            user.FullName = model.FullName;

            try
            {
                var res = await _userManager.CreateAsync(user, model.Password);
                await _userManager.AddToRoleAsync(user, model.Role);
                return Ok(res);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        [Route("Login")]
        //POST : /api/User/Login
        public async Task<ActionResult> Login(LoginModel model)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(model.UserName);
                if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    //Get role assigned to the user
                    var role = await _userManager.GetRolesAsync(user);
                    IdentityOptions _options = new IdentityOptions();

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                            new Claim("UserID",user.Id.ToString()),
                            new Claim(_options.ClaimsIdentity.RoleClaimType,role.FirstOrDefault())
                        }),
                        Expires = DateTime.UtcNow.AddDays(1),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSetting.JWT_Secret)), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                    var token = tokenHandler.WriteToken(securityToken);

                    return Ok(new { token });
                }
                else
                {
                    return BadRequest(new { message = "username or password is incorrect." });
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}